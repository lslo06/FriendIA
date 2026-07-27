import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ChatApiMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ChatReply {
  reply: string;
  sessionId: string | null;
  crisis: boolean;
}

export interface ChatSession {
  id_sesion_chat: string;
  nombre_sesion: string | null;
  iniciado_en: string;
  actualizado_en: string | null;
}

export interface StoredChatMessage {
  id_mensaje_chat: string;
  rol: 'user' | 'bot';
  contenido: string;
  creado_en: string;
}

async function authorizedFetch(path: string, init?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Tu sesión expiró. Inicia sesión de nuevo.');

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        ...init?.headers,
      },
    });
  } catch {
    throw new Error(
      `No se pudo conectar con FriendIA. Comprueba que el backend esté activo en ${API_URL}.`
    );
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'No se pudo contactar a FriendIA');
  return result;
}

export async function listChatSessions(): Promise<ChatSession[]> {
  const result = await authorizedFetch('/api/chat/sessions');
  return Array.isArray(result.sessions) ? result.sessions : [];
}

export async function getChatMessages(sessionId: string): Promise<StoredChatMessage[]> {
  const result = await authorizedFetch(
    `/api/chat/sessions/${encodeURIComponent(sessionId)}/messages`
  );
  return Array.isArray(result.messages) ? result.messages : [];
}

export async function requestChatReply(
  messages: ChatApiMessage[],
  sessionId: string | null
): Promise<ChatReply> {
  const result = await authorizedFetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ messages, sessionId }),
  });
  if (typeof result.reply !== 'string' || !result.reply.trim()) {
    throw new Error('La IA devolvió una respuesta vacía');
  }

  return {
    reply: result.reply.trim(),
    sessionId: typeof result.sessionId === 'string' ? result.sessionId : null,
    crisis: Boolean(result.crisis),
  };
}
