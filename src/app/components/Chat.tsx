import { useState, useRef, useEffect } from "react";
import { Send, AlertTriangle } from "lucide-react";
import logoImg from "figma:asset/01c21fb0-9201-45ea-a054-5ec5bdc2f330.png";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
  time: string;
}

interface ChatProps {
  userName: string;
  onEmergency: () => void;
}

function now() {
  return new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

const initialMessages: Message[] = [
  { id: 1, from: "bot", text: "Hola, me alegra que estés aquí. ¿Cómo te has sentido hoy? 💙", time: "9:00" },
  { id: 2, from: "user", text: "Hoy fue un día bastante difícil, tuve mucho estrés en el trabajo.", time: "9:01" },
  { id: 3, from: "bot", text: "Entiendo, el estrés laboral puede ser muy agotador. ¿Quieres contarme qué pasó? Estoy aquí para escucharte sin juicios. 🌿", time: "9:01" },
];

export function Chat({ userName, onEmergency }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sessionMin, setSessionMin] = useState(8);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), from: "user", text: input, time: now() };
    const botResponse: Message = {
      id: Date.now() + 1, from: "bot",
      text: "Gracias por compartir eso conmigo. Recuerda que cada paso que das, por pequeño que sea, es un avance. ¿Cómo te sientes al hablar de esto? 💙",
      time: now()
    };
    setMessages(m => [...m, userMsg, botResponse]);
    setInput("");
    setSessionMin(m => m + 1);
  }

  return (
    <div className="flex-1 flex flex-col" style={{ background: "#121820", overflow: "hidden" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#1A2332" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden" style={{ background: "rgba(91,136,178,0.2)" }}>
            <img src={logoImg} alt="bot" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#E2E8F0" }}>Tu Guía Emocional</p>
            <div className="flex items-center gap-1.5">
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4CD964" }} />
              <span style={{ fontSize: 12, color: "#94A3B8" }}>Disponible</span>
            </div>
          </div>
        </div>
        <span style={{ fontSize: 12, color: "#94A3B8" }}>Sesión de hoy: {sessionMin} min</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            <div style={{ maxWidth: "68%" }}>
              <div
                className="px-4 py-3 rounded-2xl"
                style={{
                  background: msg.from === "bot" ? "rgba(91,136,178,0.15)" : "#5B88B2",
                  color: "#E2E8F0",
                  borderTopLeftRadius: msg.from === "bot" ? 4 : 16,
                  borderTopRightRadius: msg.from === "user" ? 4 : 16,
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >{msg.text}</div>
              <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 4, textAlign: msg.from === "user" ? "right" : "left" }}>{msg.time}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Emergency card */}
      <div className="mx-6 mb-3 p-3 rounded-xl flex items-center gap-3" style={{ background: "rgba(226,75,74,0.06)", border: "1px solid rgba(226,75,74,0.25)" }}>
        <AlertTriangle size={15} color="#E24B4A" />
        <p style={{ fontSize: 12, color: "#94A3B8", flex: 1 }}>Si estás en crisis, contacta ayuda profesional.</p>
        <button onClick={onEmergency} style={{ fontSize: 12, color: "#E24B4A", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Ver opciones</button>
      </div>

      {/* Input */}
      <div className="px-6 pb-5">
        <div className="flex items-center gap-3 p-2 pl-4 rounded-2xl" style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Escribe cómo te sientes..."
            className="flex-1 outline-none bg-transparent"
            style={{ fontSize: 14, color: "#E2E8F0" }}
          />
          <button
            onClick={sendMessage}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ background: input.trim() ? "#5B88B2" : "#1E2D42" }}
          >
            <Send size={16} color={input.trim() ? "#fff" : "#94A3B8"} />
          </button>
        </div>
      </div>
    </div>
  );
}
