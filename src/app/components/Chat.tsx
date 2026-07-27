import { useState, useRef, useEffect } from "react";
import { Send, AlertTriangle, Clock, Wind, Anchor, Loader2, History, Plus, X } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { getChatMessages, listChatSessions, requestChatReply, type ChatApiMessage, type ChatSession } from "@/lib/chat";

interface Message {
  id: number;
  from: "bot" | "user" | "system";
  text: string;
  time: string;
  type?: "grounding" | "overuse" | "normal";
}

interface ChatProps {
  userName: string;
  onEmergency: () => void;
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
    icon: "🌿"
  },
  {
    title: "Respiración cuadrada",
    desc: "Inhala contando 4 segundos → sostén 4 segundos → exhala 4 segundos → sostén 4 segundos. Repite 4 veces. Tu sistema nervioso lo agradecerá.",
    icon: "🌬️"
  },
  {
    title: "Anclaje físico",
    desc: "Coloca ambos pies en el suelo. Siente el contacto. Aprieta suavemente los puños y suéltalos. Nota cómo tu cuerpo está aquí, ahora, seguro.",
    icon: "⚓"
  }
];

function createInitialMessages(userName: string): Message[] {
  const name = userName.trim();
  return [{
    id: 1,
    from: "bot",
    text: `Hola${name ? `, ${name}` : ""}. Me alegra que estés aquí. ¿Cómo te has sentido hoy? 💙`,
    time: now(),
  }];
}

const SESSION_WARN_MIN = 30;

export function Chat({ userName, onEmergency }: ChatProps) {
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
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionRef = useRef<ReturnType<typeof setInterval>>();
  const chatSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    sessionRef.current = setInterval(() => {
      setSessionMin(m => {
        const next = m + 1;
        if (next === SESSION_WARN_MIN) setShowOveruseWarning(true);
        return next;
      });
    }, 60000);
    return () => clearInterval(sessionRef.current);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    if (!showHistory && !showGrounding) inputRef.current?.focus();
  }, [isSending, showHistory, showGrounding]);

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
    setMessages(createInitialMessages(userName));
    setShowHistory(false);
    setNegativeCount(0);
    setShowGrounding(false);
    requestAnimationFrame(() => inputRef.current?.focus());
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
      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (error) {
      const text = error instanceof Error ? error.message : "No se pudo abrir la conversación";
      setMessages(current => [...current, { id: Date.now(), from: "bot", text, time: now() }]);
      setShowHistory(false);
      requestAnimationFrame(() => inputRef.current?.focus());
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
        text: "He notado que llevamos un rato en pensamientos que se repiten y eso puede ser agotador. A veces es útil hacer una pequeña pausa para anclar la mente al momento presente antes de continuar. ¿Te gustaría intentar una técnica breve de regulación? 🌿",
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

  return (
    <div className="relative flex-1 flex flex-col" style={{ background: "var(--app-bg)", overflow: "hidden" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--app-border)", background: "var(--app-surface)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center" style={{ background: "rgba(91,136,178,0.2)" }}>
            <img src={logoImg} alt="bot" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
          </div>
          <div>
            <p style={{ fontSize: "calc(15px * var(--app-font-scale))", fontWeight: 600, color: "var(--app-text)" }}>Tu Guía Emocional</p>
            <div className="flex items-center gap-1.5">
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4CD964" }} />
              <span style={{ fontSize: "calc(12px * var(--app-font-scale))", color: "var(--app-text-muted)" }}>Disponible · No diagnóstica, no terapéutica</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
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

      {/* Overuse warning banner */}
      {showOveruseWarning && (
        <div className="mx-6 mt-4 p-3 rounded-xl flex items-start gap-3" style={{ background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.3)" }}>
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
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
        {messages.map(msg => {
          if (msg.from === "system") return null;
          const isBot = msg.from === "bot";
          const isGrounding = msg.type === "grounding";
          return (
            <div key={msg.id} className={`flex ${!isBot ? "justify-end" : "justify-start"}`}>
              <div style={{ maxWidth: "70%" }}>
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
            </div>
          );
        })}

        {/* Grounding card */}
        {showGrounding && (
          <div className="p-4 rounded-2xl" style={{ background: "var(--app-surface)", border: "1px solid rgba(76,217,100,0.25)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Anchor size={14} color="#4CD964" />
              <span style={{ fontSize: "calc(13px * var(--app-font-scale))", fontWeight: 600, color: "#4CD964" }}>{gt.title} {gt.icon}</span>
            </div>
            <p style={{ fontSize: "calc(13px * var(--app-font-scale))", color: "var(--app-text-muted)", lineHeight: 1.6, marginBottom: 12 }}>{gt.desc}</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowGrounding(false);
                  const resumeMsg: Message = { id: Date.now(), from: "bot", text: "Cuando te sientas listo/a, seguimos. Estoy aquí. 💙", time: now() };
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

        <div ref={bottomRef} />
      </div>

      {/* Emergency card */}
      <div className="mx-6 mb-3 p-3 rounded-xl flex items-center gap-3" style={{ background: "rgba(226,75,74,0.06)", border: "1px solid rgba(226,75,74,0.2)" }}>
        <AlertTriangle size={14} color="#E24B4A" />
        <p style={{ fontSize: "calc(12px * var(--app-font-scale))", color: "var(--app-text-muted)", flex: 1 }}>Si estás en crisis, contacta ayuda profesional.</p>
        <button onClick={onEmergency} style={{ fontSize: "calc(12px * var(--app-font-scale))", color: "#E24B4A", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Ver opciones</button>
      </div>

      {/* Input */}
      <div className="px-6 pb-5">
        <div className="flex items-center gap-3 p-2 pl-4 rounded-2xl" style={{ background: "var(--app-surface)", border: "1px solid var(--app-border-medium)" }}>
          <input
            ref={inputRef}
            autoFocus
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
