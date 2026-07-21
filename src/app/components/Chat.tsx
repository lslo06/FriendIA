import { useState, useRef, useEffect } from "react";
import { Send, AlertTriangle, Clock, Wind, Anchor } from "lucide-react";
import logoImg from "@/assets/logo.png";

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

const initialMessages: Message[] = [
  { id: 1, from: "bot", text: `Hola, me alegra que estés aquí. ¿Cómo te has sentido hoy? 💙`, time: "9:00" },
  { id: 2, from: "user", text: "Hoy fue un día bastante difícil, tuve mucho estrés en el trabajo.", time: "9:01" },
  { id: 3, from: "bot", text: "Entiendo, el estrés laboral puede ser muy agotador. ¿Qué fue lo que lo desencadenó? Cuéntame a tu ritmo — estoy aquí para escucharte. 🌿", time: "9:01" },
];

const SESSION_WARN_MIN = 30;

export function Chat({ userName, onEmergency }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sessionMin, setSessionMin] = useState(8);
  const [showGrounding, setShowGrounding] = useState(false);
  const [groundingIdx, setGroundingIdx] = useState(0);
  const [showOveruseWarning, setShowOveruseWarning] = useState(false);
  const [negativeCount, setNegativeCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<ReturnType<typeof setInterval>>();

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
  }, [messages]);

  function detectAndRespond(userText: string): { isCrisis: boolean; isRumination: boolean } {
    const lower = userText.toLowerCase();
    const isCrisis = crisisKeywords.some(k => lower.includes(k));
    const isRumination = ruminationKeywords.some(k => lower.includes(k));
    return { isCrisis, isRumination };
  }

  function sendMessage() {
    if (!input.trim()) return;
    const text = input.trim();
    const userMsg: Message = { id: Date.now(), from: "user", text, time: now() };

    const { isCrisis, isRumination } = detectAndRespond(text);
    const newNeg = isRumination ? negativeCount + 1 : 0;
    setNegativeCount(newNeg);

    let botText = "";
    let msgType: Message["type"] = "normal";

    if (isCrisis) {
      botText = "Noto que estás pasando por algo muy intenso ahora mismo. Lo que sientes importa, y no estás solo/a. ¿Estarías dispuesto/a a hablar con un profesional que puede acompañarte mejor en este momento? 💙";
      setTimeout(() => onEmergency(), 1200);
    } else if (newNeg >= 2) {
      msgType = "grounding";
      botText = "He notado que llevamos un rato en pensamientos que se repiten y eso puede ser agotador. A veces es útil hacer una pequeña pausa para anclar la mente al momento presente antes de continuar. ¿Te gustaría intentar una técnica breve de regulación? 🌿";
      setShowGrounding(true);
      setGroundingIdx(Math.floor(Math.random() * groundingTechniques.length));
      setNegativeCount(0);
    } else {
      botText = "Gracias por compartir eso conmigo. ¿Cómo te hace sentir hablar de esto? 💙";
    }

    const botMsg: Message = { id: Date.now() + 1, from: "bot", text: botText, time: now(), type: msgType };
    setMessages(m => [...m, userMsg, botMsg]);
    setInput("");
  }

  const gt = groundingTechniques[groundingIdx];

  return (
    <div className="flex-1 flex flex-col" style={{ background: "var(--app-bg)", overflow: "hidden" }}>
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
        <div className="flex items-center gap-2" style={{ color: sessionMin >= SESSION_WARN_MIN ? "#F5A623" : "var(--app-text-muted)" }}>
          <Clock size={14} />
          <span style={{ fontSize: "calc(12px * var(--app-font-scale))" }}>Sesión de hoy: {sessionMin} min</span>
        </div>
      </div>

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
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Escribe cómo te sientes..."
            className="flex-1 outline-none bg-transparent"
            style={{ fontSize: "calc(14px * var(--app-font-scale))", color: "var(--app-text)" }}
          />
          <button
            onClick={sendMessage}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ background: input.trim() ? "#5B88B2" : "var(--app-muted)" }}
          >
            <Send size={16} color={input.trim() ? "#fff" : "var(--app-text-muted)"} />
          </button>
        </div>
        <p style={{ fontSize: "calc(11px * var(--app-font-scale))", color: "var(--app-muted-strong)", textAlign: "center", marginTop: 8 }}>
          FriendIA no diagnostica ni reemplaza la atención psicológica profesional.
        </p>
      </div>
    </div>
  );
}
