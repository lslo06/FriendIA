import { X } from "lucide-react";

interface EmergencyModalProps {
  onClose: () => void;
  onGoToHelp: () => void;
}

export function EmergencyModal({ onClose, onGoToHelp }: EmergencyModalProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ background: "rgba(10,14,20,0.85)", backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl"
        style={{ background: "#1A2332", border: "1px solid rgba(91,136,178,0.3)", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}
      >
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: "rgba(91,136,178,0.15)" }}>
            <span style={{ fontSize: 32 }}>💙</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#E2E8F0", marginBottom: 10 }}>
            Parece que estás pasando por algo difícil
          </h2>
          <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.7, marginBottom: 24 }}>
            Estamos aquí contigo. Estas opciones pueden ayudarte ahora mismo.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={onGoToHelp}
              className="w-full py-3.5 rounded-xl transition-all"
              style={{ background: "#5B88B2", color: "#fff", fontWeight: 600, fontSize: 15 }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#4a76a0")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#5B88B2")}
            >Hablar con un psicólogo</button>
            <button
              onClick={onGoToHelp}
              className="w-full py-3.5 rounded-xl transition-all"
              style={{ border: "1px solid rgba(226,75,74,0.4)", color: "#E24B4A", background: "transparent", fontWeight: 600, fontSize: 15 }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(226,75,74,0.08)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >Ver líneas de crisis</button>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", fontSize: 13, marginTop: 4 }}
            >Volver al chat</button>
          </div>
        </div>
      </div>
    </div>
  );
}
