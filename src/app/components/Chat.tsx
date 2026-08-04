import { useState, useRef, useEffect } from "react";
import { Send, AlertTriangle, Clock, Wind, Anchor, Loader2, History, Plus, X, HeartPulse, CircleCheck, ArrowLeft } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import logoImg from "@/assets/logo.png";
import { getChatMessages, listChatSessions, requestChatReply, type ChatApiMessage, type ChatSession } from "@/lib/chat";
import {
  createEmotionRecord,
  EMOTION_CHECKIN_OPTIONS,
  fetchEmotionRecords,
  isEmotionFromToday,
} from "@/lib/emotions";
import type { EmotionRecord } from "@/lib/types";
import { emotionIcons, getEmotionIcon } from "@/lib/emotionIcons";

interface Message {
  id: number;
  from: "bot" | "user" | "system";
  text: string;
  time: string;
  type?: "grounding" | "overuse" | "normal";
}

interface ChatProps {
  userId: string;
  userName: string;
  onEmergency: () => void;
  onBack: () => void;
}

function now() {
  return new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

// Keywords that suggest rumination or emotional distress loops
const ruminationKeywords = ["no puedo dejar de pensar", "sigo pensando", "siempre igual", "nunca va a cambiar", "todo está mal", "sin sentido", "para qué", "no sirvo", "no tiene caso"];
const crisisKeywords = ["hacerme daño", "lastimarme", "no quiero seguir", "desaparecer", "quitarme la vida", "suicidarme", "morir"];

const groundingTechniques = [
  {
    title: "Técnica 5-4-3-2-1",
    desc: "Nombra 5 cosas que puedes VER, 4 que puedes TOCAR, 3 que puedes ESCUCHAR, 2 que puedes OLER y 1 que puedes SABOREAR. Esto ancla tu mente al momento presente.",
    icon: emotionIcons.calm
  },
  {
    title: "Respiración cuadrada",
    desc: "Inhala contando 4 segundos → sostén 4 segundos → exhala 4 segundos → sostén 4 segundos. Repite 4 veces. Tu sistema nervioso lo agradecerá.",
    icon: emotionIcons.breathing
  },
  {
    title: "Anclaje físico",
    desc: "Coloca ambos pies en el suelo. Siente el contacto. Aprieta suavemente los puños y suéltalos. Nota cómo tu cuerpo está aquí, ahora, seguro.",
    icon: emotionIcons.anchor
  }
];

function createInitialMessages(userName: string, emotion?: EmotionRecord | null): Message[] {
  const name = userName.trim();
  const mood = emotion
    ? `${emotion.primary_emotion}${emotion.emotions[0] ? ` · ${emotion.emotions[0]}` : ""}`
    : "";
  return [{
    id: 1,
    from: "bot",
    text: mood
      ? `Hola${name ? `, ${name}` : ""}. Hoy registraste que te sientes ${mood}. Podemos partir de ahí, aunque también está bien si tu estado ya cambió. ¿Qué te gustaría contarme?`
      : `Hola${name ? `, ${name}` : ""}. Antes de conversar, cuéntame cómo te sientes hoy.`,
    time: now(),
  }];
}

const SESSION_WARN_MIN = 30;
const SESSION_REFLECTION_MIN = 10;

export function Chat({ userId, userName, onEmergency, onBack }: ChatProps) {
  const reduceMotion = useReducedMotion();
  const [messages, setMessages] = useState<Message[]>(() => createInitialMessages(userName));
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sessionMin, setSessionMin] = useState(0);
  const [showGrounding, setShowGrounding] = useState(false);
  const [groundingIdx, setGroundingIdx] = useState(0);
  const [showOveruseWarning, setShowOveruseWarning] = useState(false);
  const [negativeCount, setNegativeCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [checkInLoading, setCheckInLoading] = useState(true);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionRecord | null>(null);
  const [checkInPrimary, setCheckInPrimary] = useState("");
  const [checkInNuance, setCheckInNuance] = useState("");
  const [checkInSaving, setCheckInSaving] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionSending, setReflectionSending] = useState(false);
  const [reflectionCompleted, setReflectionCompleted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<ReturnType<typeof setInterval>>();
  const chatSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    sessionRef.current = setInterval(() => {
      setSessionMin(m => {
        const next = m + 1;
        if (next === SESSION_WARN_MIN) setShowOveruseWarning(true);
        if (next === SESSION_REFLECTION_MIN) {
          setShowReflection(true);
        }
        return next;
      });
    }, 60000);
    return () => clearInterval(sessionRef.current);
  }, []);

  useEffect(() => {
    let active = true;
    fetchEmotionRecords(userId)
      .then(records => {
        if (!active) return;
        const today = records.find(isEmotionFromToday) ?? null;
        setCurrentEmotion(today);
        setMessages(createInitialMessages(userName, today));
      })
      .catch(error => {
        console.error("No se pudo cargar el check-in del chat:", error);
      })
      .finally(() => {
        if (active) setCheckInLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId, userName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  async function openHistory() {
    setShowHistory(true);
    setIsLoadingHistory(true);
    setHistoryError("");
    try {
      setSessions(await listChatSessions());
    } catch (error) {
      const text = error instanceof Error ? error.message : "No se pudo cargar el historial";
      setHistoryError(text);
    } finally {
      setIsLoadingHistory(false);
    }
  }

  function startNewChat() {
    chatSessionIdRef.current = null;
    setMessages(createInitialMessages(userName, currentEmotion));
    setShowHistory(false);
    setNegativeCount(0);
    setShowGrounding(false);
    setShowReflection(false);
    setReflectionCompleted(false);
    setSessionMin(0);
  }

  async function saveCheckIn() {
    if (!checkInPrimary || !checkInNuance || checkInSaving) return;
    setCheckInSaving(true);
    try {
      const record = await createEmotionRecord(userId, {
        primary: checkInPrimary,
        nuance: checkInNuance,
      });
      setCurrentEmotion(record);
      setMessages(createInitialMessages(userName, record));
    } catch (error) {
      const text = error instanceof Error ? error.message : "No se pudo guardar tu estado";
      setMessages(current => [...current, { id: Date.now(), from: "bot", text, time: now() }]);
    } finally {
      setCheckInSaving(false);
    }
  }

  async function submitReflection(outcome: "mejor" | "igual" | "más difícil") {
    if (reflectionSending) return;
    const reflectionText = outcome === "mejor"
      ? "Al cerrar esta conversación, siento que estoy mejor y que hablarlo me ayudó a desahogarme."
      : outcome === "igual"
        ? "Al cerrar esta conversación, me siento prácticamente igual. Hablarlo me ayudó solo un poco o todavía no noto un cambio."
        : "Al cerrar esta conversación, siento que esto sigue siendo difícil o que me siento peor. Necesito una respuesta cuidadosa y opciones de apoyo.";
    const userMsg: Message = { id: Date.now(), from: "user", text: reflectionText, time: now() };
    const apiMessages: ChatApiMessage[] = [...messages, userMsg]
      .filter(message => message.from !== "system")
      .map(message => ({
        role: message.from === "bot" ? "model" : "user",
        text: message.text,
      }));

    setMessages(current => [...current, userMsg]);
    setReflectionSending(true);
    try {
      const result = await requestChatReply(apiMessages, chatSessionIdRef.current);
      if (result.sessionId) chatSessionIdRef.current = result.sessionId;
      setMessages(current => [...current, {
        id: Date.now() + 1,
        from: "bot",
        text: result.reply,
        time: now(),
      }]);
      setReflectionCompleted(true);
      setShowReflection(false);
      if (outcome === "más difícil" || result.crisis) {
        setTimeout(() => onEmergency(), 400);
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : "No se pudo guardar tu reflexión";
      setMessages(current => [...current, { id: Date.now() + 1, from: "bot", text, time: now() }]);
    } finally {
      setReflectionSending(false);
    }
  }

  async function openSession(session: ChatSession) {
    setIsLoadingHistory(true);
    try {
      const stored = await getChatMessages(session.id_sesion_chat);
      setMessages(stored.map((message, index) => ({
        id: new Date(message.creado_en).getTime() + index,
        from: message.rol === "bot" ? "bot" : "user",
        text: message.contenido,
        time: new Date(message.creado_en).toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      })));
      chatSessionIdRef.current = session.id_sesion_chat;
      setShowHistory(false);
    } catch (error) {
      const text = error instanceof Error ? error.message : "No se pudo abrir la conversación";
      setMessages(current => [...current, { id: Date.now(), from: "bot", text, time: now() }]);
      setShowHistory(false);
    } finally {
      setIsLoadingHistory(false);
    }
  }

  function detectAndRespond(userText: string): { isCrisis: boolean; isRumination: boolean } {
    const lower = userText.toLowerCase();
    const isCrisis = crisisKeywords.some(k => lower.includes(k));
    const isRumination = ruminationKeywords.some(k => lower.includes(k));
    return { isCrisis, isRumination };
  }

  async function sendMessage() {
    if (!input.trim() || isSending) return;
    const text = input.trim();
    const userMsg: Message = { id: Date.now(), from: "user", text, time: now() };

    const { isCrisis, isRumination } = detectAndRespond(text);
    const newNeg = isRumination ? negativeCount + 1 : 0;
    setNegativeCount(newNeg);

    if (isCrisis) {
      const botMsg: Message = {
        id: Date.now() + 1,
        from: "bot",
        text: "Lo que estás viviendo importa. Si corres peligro o podrías hacerte daño, llama ahora a emergencias (911 en México) o pide a una persona de confianza que se quede contigo. Abre las opciones de ayuda inmediata para encontrar más apoyo.",
        time: now(),
        type: "normal",
      };
      setMessages(current => [...current, userMsg, botMsg]);
      setInput("");
      setTimeout(() => onEmergency(), 1200);
      return;
    }

    if (newNeg >= 2) {
      const botMsg: Message = {
        id: Date.now() + 1,
        from: "bot",
        text: "He notado que llevamos un rato en pensamientos que se repiten y eso puede ser agotador. A veces es útil hacer una pequeña pausa para anclar la mente al momento presente antes de continuar. ¿Te gustaría intentar una técnica breve de regulación?",
        time: now(),
        type: "grounding",
      };
      setShowGrounding(true);
      setGroundingIdx(Math.floor(Math.random() * groundingTechniques.length));
      setNegativeCount(0);
      setMessages(current => [...current, userMsg, botMsg]);
      setInput("");
      return;
    }

    const conversation = [...messages, userMsg];
    const apiMessages: ChatApiMessage[] = conversation
      .filter(message => message.from !== "system")
      .map(message => ({
        role: message.from === "bot" ? "model" : "user",
        text: message.text,
      }));

    setMessages(current => [...current, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const result = await requestChatReply(apiMessages, chatSessionIdRef.current);
      if (result.sessionId) chatSessionIdRef.current = result.sessionId;

      const botMsg: Message = {
        id: Date.now() + 1,
        from: "bot",
        text: result.reply,
        time: now(),
        type: "normal",
      };
      setMessages(current => [...current, botMsg]);

      if (result.crisis) setTimeout(() => onEmergency(), 300);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "No pude responder en este momento. Intenta de nuevo.";
      setMessages(current => [...current, {
        id: Date.now() + 1,
        from: "bot",
        text: message,
        time: now(),
        type: "normal",
      }]);
    } finally {
      setIsSending(false);
    }
  }

  const gt = groundingTechniques[groundingIdx];
  const selectedCheckInOption = EMOTION_CHECKIN_OPTIONS.find(
    option => option.core === checkInPrimary
  );

  return (
    <div className="fixed inset-0 h-[100dvh] flex flex-col md:relative md:inset-auto md:h-auto md:flex-1" style={{ background: "var(--app-bg)", overflow: "hidden" }}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 sm:px-6 py-3 sm:py-4" style={{ borderBottom: "1px solid var(--app-border)", background: "var(--app-surface)" }}>
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            onClick={onBack}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl md:hidden"
            style={{ color: "var(--app-text)", background: "var(--app-surface-alt)", border: "1px solid var(--app-border)" }}
            aria-label="Volver al inicio"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center" style={{ background: "rgba(91,136,178,0.2)" }}>
            <img src={logoImg} alt="bot" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
          </div>
          <div className="min-w-0">
            <p style={{ fontSize: "calc(15px * var(--app-font-scale))", fontWeight: 600, color: "var(--app-text)" }}>Tu Guía Emocional</p>
            <div className="flex items-center gap-1.5">
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4CD964" }} />
              <span style={{ fontSize: "calc(12px * var(--app-font-scale))", color: "var(--app-text-muted)" }}>Disponible · No diagnóstica, no terapéutica</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {messages.some(message => message.from === "user") && !reflectionCompleted && (
            <button
              onClick={() => setShowReflection(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ color: "var(--app-text)", background: "var(--app-surface-alt)", border: "1px solid var(--app-border)" }}
            >
              <HeartPulse size={15} />
              Cerrar conversación
            </button>
          )}
          <button
            onClick={() => void openHistory()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ color: "var(--app-text)", background: "var(--app-muted)", border: "none", cursor: "pointer" }}
            aria-label="Abrir historial de conversaciones"
          >
            <History size={15} />
            <span className="hidden sm:inline" style={{ fontSize: "calc(12px * var(--app-font-scale))" }}>Historial</span>
          </button>
          <div className="hidden md:flex items-center gap-2" style={{ color: sessionMin >= SESSION_WARN_MIN ? "#F5A623" : "var(--app-text-muted)" }}>
            <Clock size={14} />
            <span style={{ fontSize: "calc(12px * var(--app-font-scale))" }}>Sesión de hoy: {sessionMin} min</span>
          </div>
        </div>
      </div>

      {showHistory && (
        <div className="absolute inset-0 z-40 flex justify-end" style={{ background: "rgba(0,0,0,0.35)" }} onClick={() => setShowHistory(false)}>
          <aside
            className="h-full w-full sm:w-96 p-5 overflow-y-auto"
            style={{ background: "var(--app-surface)", borderLeft: "1px solid var(--app-border)" }}
            onClick={event => event.stopPropagation()}
            aria-label="Historial de conversaciones"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ color: "var(--app-text)", fontSize: 18, fontWeight: 700 }}>Tus conversaciones</h2>
              <button onClick={() => setShowHistory(false)} aria-label="Cerrar historial" style={{ background: "none", border: 0, color: "var(--app-text)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <button onClick={startNewChat} className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 mb-4" style={{ background: "#5B88B2", color: "#fff", border: 0, cursor: "pointer", fontWeight: 600 }}>
              <Plus size={17} /> Nueva conversación
            </button>
            {isLoadingHistory ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin" color="#5B88B2" /></div>
            ) : historyError ? (
              <div className="rounded-xl p-4 text-center" style={{ background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.25)" }}>
                <p style={{ color: "var(--app-text)", fontSize: 14 }}>{historyError}</p>
                <button onClick={() => void openHistory()} className="mt-3 px-4 py-2 rounded-lg" style={{ background: "#5B88B2", color: "#fff", border: 0, cursor: "pointer" }}>
                  Reintentar
                </button>
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-center py-10" style={{ color: "var(--app-text-muted)", fontSize: 14 }}>Aún no tienes conversaciones guardadas.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {sessions.map(session => (
                  <button key={session.id_sesion_chat} onClick={() => void openSession(session)} className="text-left rounded-xl p-3" style={{ background: "var(--app-bg)", border: "1px solid var(--app-border)", cursor: "pointer" }}>
                    <p style={{ color: "var(--app-text)", fontSize: 14, fontWeight: 600 }}>{session.nombre_sesion || "Conversación"}</p>
                    <p style={{ color: "var(--app-text-muted)", fontSize: 11, marginTop: 4 }}>
                      {new Date(session.actualizado_en || session.iniciado_en).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}

      {(checkInLoading || !currentEmotion) && (
        <div
          className="absolute inset-x-0 bottom-0 z-30 flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto"
          style={{ top: 73, background: "var(--app-bg)" }}
        >
          {checkInLoading ? (
            <div className="flex items-center gap-3" style={{ color: "var(--app-text-muted)" }}>
              <Loader2 size={22} className="animate-spin" />
              Cargando tu check-in de hoy…
            </div>
          ) : (
            <div className="w-full max-w-2xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl" style={{ background: "var(--app-surface)", border: "1px solid var(--app-border-medium)" }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(91,136,178,0.16)" }}>
                  <HeartPulse size={20} color="#78A6D1" />
                </div>
                <div>
                  <h2 style={{ color: "var(--app-text)", fontSize: 19, fontWeight: 700 }}>Antes de conversar</h2>
                  <p style={{ color: "var(--app-text-muted)", fontSize: 13 }}>FriendIA necesita saber cómo llegas hoy para acompañarte mejor.</p>
                </div>
              </div>

              <p className="mt-6 mb-3" style={{ color: "var(--app-text)", fontSize: 14, fontWeight: 600 }}>¿Qué emoción se parece más a lo que sientes?</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EMOTION_CHECKIN_OPTIONS.map(option => (
                  <button
                    key={option.core}
                    onClick={() => {
                      setCheckInPrimary(option.core);
                      setCheckInNuance("");
                    }}
                    className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-xl text-center sm:text-left"
                    style={{
                      background: checkInPrimary === option.core ? `${option.color}1F` : "var(--app-surface-alt)",
                      border: `1px solid ${checkInPrimary === option.core ? option.color : "var(--app-border)"}`,
                      color: "var(--app-text)",
                    }}
                  >
                    <img src={getEmotionIcon(option.core) ?? ""} alt="" className="h-12 w-12 sm:h-16 sm:w-16 object-contain" style={{ imageRendering: "pixelated" }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{option.core}</span>
                  </button>
                ))}
              </div>

              {selectedCheckInOption && (
                <>
                  <p className="mt-5 mb-3" style={{ color: "var(--app-text)", fontSize: 14, fontWeight: 600 }}>¿Qué matiz lo describe mejor?</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCheckInOption.nuances.map(nuance => (
                      <button
                        key={nuance}
                        onClick={() => setCheckInNuance(nuance)}
                        className="px-3 py-2 rounded-full"
                        style={{
                          background: checkInNuance === nuance ? `${selectedCheckInOption.color}24` : "var(--app-surface-alt)",
                          border: `1px solid ${checkInNuance === nuance ? selectedCheckInOption.color : "var(--app-border)"}`,
                          color: checkInNuance === nuance ? selectedCheckInOption.color : "var(--app-text-muted)",
                          fontSize: 12,
                        }}
                      >
                        {nuance}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <button
                onClick={() => void saveCheckIn()}
                disabled={!checkInPrimary || !checkInNuance || checkInSaving}
                className="w-full mt-6 py-3 rounded-xl flex items-center justify-center gap-2"
                style={{
                  background: "#5B88B2",
                  color: "#fff",
                  opacity: !checkInPrimary || !checkInNuance || checkInSaving ? 0.5 : 1,
                  fontWeight: 700,
                }}
              >
                {checkInSaving ? <Loader2 size={16} className="animate-spin" /> : <CircleCheck size={16} />}
                Guardar y comenzar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overuse warning banner */}
      {showOveruseWarning && (
        <div className="mx-3 sm:mx-6 mt-3 sm:mt-4 p-3 rounded-xl flex items-start gap-3" style={{ background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.3)" }}>
          <Clock size={15} color="#F5A623" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "calc(13px * var(--app-font-scale))", color: "var(--app-text)", fontWeight: 600, marginBottom: 2 }}>Llevas {sessionMin} minutos aquí</p>
            <p style={{ fontSize: "calc(12px * var(--app-font-scale))", color: "var(--app-text-muted)", lineHeight: 1.5 }}>
              Está bien hacer una pausa. Las personas cercanas a ti también pueden ser un gran apoyo. ¿Hay alguien de confianza con quien puedas hablar hoy?
            </p>
          </div>
          <button onClick={() => setShowOveruseWarning(false)} style={{ fontSize: "calc(18px * var(--app-font-scale))", color: "var(--app-text-muted)", background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 sm:px-6 py-4 sm:py-5 flex flex-col gap-4">
        <AnimatePresence initial={false}>
        {messages.map(msg => {
          if (msg.from === "system") return null;
          const isBot = msg.from === "bot";
          const isGrounding = msg.type === "grounding";
          return (
            <motion.div
              key={msg.id}
              className={`flex ${!isBot ? "justify-end" : "justify-start"}`}
              initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="max-w-[88%] sm:max-w-[70%]">
                <div
                  className="px-4 py-3 rounded-2xl"
                  style={{
                    background: isGrounding
                      ? "rgba(76,217,100,0.1)"
                      : isBot ? "rgba(91,136,178,0.15)" : "#5B88B2",
                    border: isGrounding ? "1px solid rgba(76,217,100,0.25)" : "none",
                    color: "var(--app-text)",
                    borderTopLeftRadius: isBot ? 4 : 16,
                    borderTopRightRadius: !isBot ? 4 : 16,
                    fontSize: "calc(14px * var(--app-font-scale))",
                    lineHeight: 1.6,
                  }}
                >
                  {isGrounding && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <Wind size={12} color="#4CD964" />
                      <span style={{ fontSize: "calc(11px * var(--app-font-scale))", color: "#4CD964", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Técnica de regulación</span>
                    </div>
                  )}
                  {msg.text}
                </div>
                <p style={{ fontSize: "calc(11px * var(--app-font-scale))", color: "var(--app-text-muted)", marginTop: 4, textAlign: !isBot ? "right" : "left" }}>{msg.time}</p>
              </div>
            </motion.div>
          );
        })}
        </AnimatePresence>

        {/* Grounding card */}
        {showGrounding && (
          <div className="p-4 rounded-2xl" style={{ background: "var(--app-surface)", border: "1px solid rgba(76,217,100,0.25)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Anchor size={14} color="#4CD964" />
              <span className="flex items-center gap-2" style={{ fontSize: "calc(13px * var(--app-font-scale))", fontWeight: 600, color: "#4CD964" }}>
                <img src={gt.icon} alt="" className="h-8 w-8 object-contain" />
                {gt.title}
              </span>
            </div>
            <p style={{ fontSize: "calc(13px * var(--app-font-scale))", color: "var(--app-text-muted)", lineHeight: 1.6, marginBottom: 12 }}>{gt.desc}</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowGrounding(false);
                  const resumeMsg: Message = { id: Date.now(), from: "bot", text: "Cuando te sientas listo/a, seguimos. Estoy aquí.", time: now() };
                  setMessages(m => [...m, resumeMsg]);
                }}
                className="px-4 py-2 rounded-xl text-sm transition-all"
                style={{ background: "#4CD964", color: "var(--app-bg)", fontWeight: 600 }}
              >Lo intentaré</button>
              <button
                onClick={() => setShowGrounding(false)}
                style={{ fontSize: "calc(13px * var(--app-font-scale))", color: "var(--app-text-muted)", background: "none", border: "none", cursor: "pointer" }}
              >Prefiero continuar</button>
            </div>
          </div>
        )}

        {isSending && (
          <div className="flex justify-start">
            <div
              className="px-4 py-3 rounded-2xl flex items-center gap-2"
              style={{
                background: "rgba(91,136,178,0.15)",
                color: "var(--app-text-muted)",
                fontSize: "calc(13px * var(--app-font-scale))",
                borderTopLeftRadius: 4,
              }}
            >
              <Loader2 size={14} className="animate-spin" />
              FriendIA está escribiendo…
            </div>
          </div>
        )}

        {showReflection && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl"
            style={{ background: "var(--app-surface)", border: "1px solid rgba(120,166,209,0.32)" }}
          >
            <div className="flex items-start gap-3">
              <HeartPulse size={20} color="#78A6D1" style={{ flexShrink: 0, marginTop: 2 }} />
              <div className="flex-1">
                <p style={{ color: "var(--app-text)", fontSize: 15, fontWeight: 700 }}>Antes de cerrar, ¿algo cambió?</p>
                <p className="mt-1" style={{ color: "var(--app-text-muted)", fontSize: 13, lineHeight: 1.5 }}>
                  No hay una respuesta correcta. Esto ayuda a FriendIA a saber si hablarlo te permitió sentirte un poco mejor o desahogarte.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                  {([
                    ["mejor", "Me siento mejor"],
                    ["igual", "Me siento igual"],
                    ["más difícil", "Sigue siendo difícil"],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => void submitReflection(value)}
                      disabled={reflectionSending}
                      className="px-3 py-2.5 rounded-xl"
                      style={{
                        background: value === "mejor" ? "rgba(76,217,100,0.12)" : "var(--app-surface-alt)",
                        border: `1px solid ${value === "mejor" ? "rgba(76,217,100,0.28)" : "var(--app-border)"}`,
                        color: "var(--app-text)",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowReflection(false)}
                  disabled={reflectionSending}
                  className="mt-3"
                  style={{ background: "none", border: 0, color: "var(--app-text-muted)", fontSize: 12 }}
                >
                  Seguir conversando
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {messages.some(message => message.from === "user") && !reflectionCompleted && (
        <div className="shrink-0 px-3 pb-2 sm:hidden">
          <button
            onClick={() => setShowReflection(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2"
            style={{ color: "var(--app-text)", background: "var(--app-surface-alt)", border: "1px solid var(--app-border)", fontSize: 12, fontWeight: 600 }}
          >
            <HeartPulse size={15} />
            Terminar conversación
          </button>
        </div>
      )}

      {/* Emergency card */}
      <div className="shrink-0 mx-3 sm:mx-6 mb-2 sm:mb-3 p-2.5 sm:p-3 rounded-xl flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3" style={{ background: "rgba(226,75,74,0.06)", border: "1px solid rgba(226,75,74,0.2)" }}>
        <AlertTriangle size={14} color="#E24B4A" />
        <p style={{ fontSize: "calc(12px * var(--app-font-scale))", color: "var(--app-text-muted)", flex: 1 }}>Si estás en crisis, contacta ayuda profesional.</p>
        <button onClick={onEmergency} style={{ fontSize: "calc(12px * var(--app-font-scale))", color: "#E24B4A", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Ver opciones</button>
      </div>

      {/* Input */}
      <div className="shrink-0 px-3 sm:px-6 pb-[max(12px,env(safe-area-inset-bottom))] sm:pb-5">
        <div className="flex items-center gap-3 p-2 pl-4 rounded-2xl" style={{ background: "var(--app-surface)", border: "1px solid var(--app-border-medium)" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Escribe cómo te sientes..."
            className="flex-1 outline-none bg-transparent"
            style={{ fontSize: "calc(14px * var(--app-font-scale))", color: "var(--app-text)" }}
          />
          <button
            onClick={() => void sendMessage()}
            disabled={isSending || !input.trim()}
            aria-label="Enviar mensaje"
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: input.trim() && !isSending ? "#5B88B2" : "var(--app-muted)",
              cursor: input.trim() && !isSending ? "pointer" : "not-allowed",
            }}
          >
            <Send size={16} color={input.trim() && !isSending ? "#fff" : "var(--app-text-muted)"} />
          </button>
        </div>
        <p style={{ fontSize: "calc(11px * var(--app-font-scale))", color: "var(--app-muted-strong)", textAlign: "center", marginTop: 8 }}>
          FriendIA no diagnostica ni reemplaza la atención psicológica profesional.
        </p>
      </div>
    </div>
  );
}
