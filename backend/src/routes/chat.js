const express = require('express');
const router = express.Router();
const supabase = require('../db');
const { requireProfile } = require('../auth');
const { generateReply, extractMemories } = require('../gemini');
const { containsCrisisLanguage } = require('../crisis');

const MAX_MESSAGES = 16;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_TOTAL_LENGTH = 24000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_REQUESTS = 15;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const requestWindows = new Map();
router.use(requireProfile);

function normalizeMessages(input) {
  if (!Array.isArray(input) || input.length === 0) return null;

  const messages = input.slice(-MAX_MESSAGES).map(message => ({
    role: message?.role === 'model' ? 'model' : message?.role === 'user' ? 'user' : null,
    text: typeof message?.text === 'string'
      ? message.text.trim().slice(0, MAX_MESSAGE_LENGTH)
      : '',
  }));

  if (messages.some(message => !message.role || !message.text)) return null;
  while (messages[0]?.role === 'model') messages.shift();
  if (messages.length === 0) return null;
  if (messages.at(-1)?.role !== 'user') return null;

  const totalLength = messages.reduce((total, message) => total + message.text.length, 0);
  return totalLength <= MAX_TOTAL_LENGTH ? messages : null;
}

function isRateLimited(userId) {
  const now = Date.now();
  const current = requestWindows.get(userId);

  if (!current || now - current.startedAt >= RATE_LIMIT_WINDOW_MS) {
    requestWindows.set(userId, { startedAt: now, count: 1 });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_REQUESTS;
}

function isMissingColumn(error, columnName) {
  return (
    error?.code === '42703'
    || error?.code === 'PGRST204'
    || error?.message?.includes(columnName)
  );
}

async function loadPersonalization(profileId) {
  const [profileResult, disabilityResult, settingsResult, emotionResult] = await Promise.all([
    supabase
      .schema('Group_By')
      .from('perfiles')
      .select('nombre,genero,tono_preferido,preocupaciones')
      .eq('id_perfil', profileId)
      .single(),
    supabase
      .schema('Group_By')
      .from('perfil_discapacidad')
      .select('tipo_discapacidad(nombre)')
      .eq('id_perfil', profileId)
      .maybeSingle(),
    supabase
      .schema('Group_By')
      .from('configuraciones_usuario')
      .select('guardar_historial_chat')
      .eq('id_perfil', profileId)
      .maybeSingle(),
    supabase
      .schema('Group_By')
      .from('registros_emociones')
      .select('fecha_registro,etiqueta_animo,etiquetas_emociones,notas')
      .eq('id_perfil', profileId)
      .order('fecha_registro', { ascending: false })
      .order('creado_en', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (profileResult.error) throw profileResult.error;

  if (disabilityResult.error) {
    console.warn('No se pudo cargar la discapacidad para personalizar el chat');
  }
  if (settingsResult.error) {
    console.warn('No se pudo cargar la preferencia de historial del chat');
  }
  if (emotionResult.error) {
    console.warn('No se pudo cargar el check-in emocional para personalizar el chat');
  }

  const relation = disabilityResult.data?.tipo_discapacidad;
  const disabilityType = Array.isArray(relation) ? relation[0] : relation;

  return {
    profile: profileResult.data,
    disability: disabilityType?.nombre || null,
    currentEmotion: emotionResult.error ? null : emotionResult.data,
    saveHistory: settingsResult.error
      ? false
      : Boolean(settingsResult.data?.guardar_historial_chat),
  };
}

async function findOrCreateSession(profileId, requestedSessionId, firstMessage) {
  if (UUID_PATTERN.test(requestedSessionId || '')) {
    const { data, error } = await supabase
      .schema('Group_By')
      .from('sesiones_chat')
      .select('id_sesion_chat')
      .eq('id_sesion_chat', requestedSessionId)
      .eq('id_perfil', profileId)
      .maybeSingle();

    if (!error && data) return data.id_sesion_chat;
  }

  let { data, error } = await supabase
    .schema('Group_By')
    .from('sesiones_chat')
    .insert({
      id_perfil: profileId,
      nombre_sesion: firstMessage.replace(/\s+/g, ' ').trim().slice(0, 60),
    })
    .select('id_sesion_chat')
    .single();

  // Compatibilidad con instalaciones creadas por 001_initial_schema.sql.
  if (error && isMissingColumn(error, 'nombre_sesion')) {
    const fallback = await supabase
      .schema('Group_By')
      .from('sesiones_chat')
      .insert({ id_perfil: profileId })
      .select('id_sesion_chat')
      .single();
    data = fallback.data;
    error = fallback.error;
  }

  if (error) throw error;
  return data.id_sesion_chat;
}

async function persistExchange({ profileId, requestedSessionId, userText, reply }) {
  const sessionId = await findOrCreateSession(profileId, requestedSessionId, userText);
  const payload = [
    {
      id_sesion_chat: sessionId,
      id_perfil: profileId,
      rol: 'user',
      contenido: userText,
    },
    {
      id_sesion_chat: sessionId,
      id_perfil: profileId,
      rol: 'bot',
      contenido: reply,
    },
  ];
  let { error } = await supabase
    .schema('Group_By')
    .from('mensajes_chat')
    .insert(payload);

  // Compatibilidad con instalaciones donde mensajes_chat aun no tiene id_perfil.
  if (error && isMissingColumn(error, 'id_perfil')) {
    const fallback = await supabase
      .schema('Group_By')
      .from('mensajes_chat')
      .insert(payload.map(({ id_perfil: _idPerfil, ...message }) => message));
    error = fallback.error;
  }

  if (error) throw error;
  await supabase
    .schema('Group_By')
    .from('sesiones_chat')
    .update({ actualizado_en: new Date().toISOString() })
    .eq('id_sesion_chat', sessionId)
    .eq('id_perfil', profileId);
  return sessionId;
}

async function loadMemories(profileId) {
  const { data, error } = await supabase
    .schema('Group_By')
    .from('memorias_chat')
    .select('contenido')
    .eq('id_perfil', profileId)
    .order('actualizado_en', { ascending: false })
    .limit(30);

  if (error) {
    if (error.code === '42P01' || error.code === 'PGRST205') return [];
    throw error;
  }
  return (data || []).map(item => item.contenido);
}

async function saveMemories(profileId, userText) {
  const memories = await extractMemories(userText);
  if (memories.length === 0) return;

  const rows = memories.map(memory => ({
    id_perfil: profileId,
    contenido: memory.content,
    contenido_normalizado: memory.content
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim(),
    categoria: memory.category,
    actualizado_en: new Date().toISOString(),
  }));
  const { error } = await supabase
    .schema('Group_By')
    .from('memorias_chat')
    .upsert(rows, { onConflict: 'id_perfil,contenido_normalizado' });

  if (error && error.code !== '42P01' && error.code !== 'PGRST205') throw error;
}

function mayContainDurableMemory(text) {
  const normalized = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  // Evita gastar una segunda llamada a Gemini en saludos o estados pasajeros.
  return [
    /\bmi (novi[oa]|pareja|espos[oa]|amig[oa]|herman[oa]|mama|papa)\b/,
    /\b(se llama|me gusta|prefiero|mi meta|quiero lograr)\b/,
    /\b(estudio|trabajo|vivo|tengo \d+ anos)\b/,
    /\bsoy (estudiante|maestr[oa]|ingenier[oa]|doctor|doctora)\b/,
  ].some(pattern => pattern.test(normalized));
}

router.get('/sessions', async (req, res) => {
  try {
    let { data, error } = await supabase
      .schema('Group_By')
      .from('sesiones_chat')
      .select('id_sesion_chat,nombre_sesion,iniciado_en,actualizado_en')
      .eq('id_perfil', req.profileId)
      .order('actualizado_en', { ascending: false })
      .limit(50);

    // Permite abrir el historial aunque la migración 008 aún no se haya aplicado.
    if (
      error
      && (isMissingColumn(error, 'nombre_sesion') || isMissingColumn(error, 'actualizado_en'))
    ) {
      const fallback = await supabase
        .schema('Group_By')
        .from('sesiones_chat')
        .select('id_sesion_chat,iniciado_en')
        .eq('id_perfil', req.profileId)
        .order('iniciado_en', { ascending: false })
        .limit(50);
      data = (fallback.data || []).map(session => ({
        ...session,
        nombre_sesion: null,
        actualizado_en: session.iniciado_en,
      }));
      error = fallback.error;
    }

    if (error) throw error;
    return res.json({ sessions: data || [] });
  } catch (error) {
    console.error('No se pudo cargar el historial:', error.message);
    return res.status(500).json({ error: 'No se pudo cargar el historial' });
  }
});

router.get('/sessions/:sessionId/messages', async (req, res) => {
  if (!UUID_PATTERN.test(req.params.sessionId)) {
    return res.status(400).json({ error: 'ConversaciÃ³n no vÃ¡lida' });
  }
  try {
    const { data: session, error: sessionError } = await supabase
      .schema('Group_By')
      .from('sesiones_chat')
      .select('id_sesion_chat')
      .eq('id_sesion_chat', req.params.sessionId)
      .eq('id_perfil', req.profileId)
      .maybeSingle();
    if (sessionError) throw sessionError;
    if (!session) return res.status(404).json({ error: 'ConversaciÃ³n no encontrada' });

    const { data, error } = await supabase
      .schema('Group_By')
      .from('mensajes_chat')
      .select('id_mensaje_chat,rol,contenido,creado_en')
      .eq('id_sesion_chat', req.params.sessionId)
      .order('creado_en', { ascending: true });
    if (error) throw error;
    return res.json({ messages: data || [] });
  } catch (error) {
    console.error('No se pudo abrir la conversaciÃ³n:', error.message);
    return res.status(500).json({ error: 'No se pudo abrir la conversaciÃ³n' });
  }
});

router.post('/', async (req, res) => {
  if (isRateLimited(req.authUser.id)) {
    return res.status(429).json({
      error: 'Enviaste varios mensajes muy rápido. Espera un momento e intenta de nuevo.',
    });
  }

  const messages = normalizeMessages(req.body?.messages);

  if (!messages) {
    return res.status(400).json({ error: 'El historial del chat no es válido' });
  }

  try {
    const personalization = await loadPersonalization(req.profileId);
    const userText = messages.at(-1).text;
    const isCrisis = containsCrisisLanguage(userText);
    const memories = personalization.saveHistory
      ? await loadMemories(req.profileId)
      : [];
    const reply = isCrisis
      ? 'Lo que estás viviendo importa. Si tú u otra persona corren peligro, llama ahora a emergencias (911 en México) y pide a una persona de confianza que se quede contigo. También puedes abrir las opciones de ayuda inmediata de FriendIA.'
      : await generateReply({
        messages,
        profile: personalization.profile,
        disability: personalization.disability,
        memories,
        currentEmotion: personalization.currentEmotion,
      });

    let sessionId = null;
    if (personalization.saveHistory) {
      try {
        sessionId = await persistExchange({
          profileId: req.profileId,
          requestedSessionId: req.body?.sessionId,
          userText,
          reply,
        });
        if (mayContainDurableMemory(userText)) {
          await saveMemories(req.profileId, userText);
        }
      } catch (historyError) {
        console.error('No se pudo guardar el intercambio del chat:', historyError.message);
      }
    }

    return res.json({ reply, sessionId, crisis: isCrisis });
  } catch (error) {
    console.error('Error generando la respuesta del chat:', error.message);

    if (error.code === 'GEMINI_NOT_CONFIGURED') {
      return res.status(503).json({
        error: 'La IA aún no está configurada en el servidor',
      });
    }

    const status = error.status === 429 || error.code === 429 ? 429 : 502;
    return res.status(status).json({
      error: status === 429
        ? 'La IA recibio demasiadas solicitudes. Intenta de nuevo en un momento.'
        : 'No se pudo obtener una respuesta de la IA',
    });
  }
});

module.exports = router;
