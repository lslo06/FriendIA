import { X } from "lucide-react";
import corazon from "../../assets/corazon.png";

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
        className="w-full max-w-md p-5 sm:p-8 rounded-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: "var(--app-surface)", border: "1px solid rgba(91,136,178,0.3)", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}
      >
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--app-text-muted)" }}>
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: "rgba(91,136,178,0.15)" }}>
            <img
  src={corazon}
  alt="Corazón"
  style={{
    width: "calc(32px * var(--app-font-scale))",
    height: "calc(32px * var(--app-font-scale))",
    objectFit: "contain",
    imageRendering: "pixelated",
  }}
/>
          </div>
          <h2 style={{ fontSize: "calc(22px * var(--app-font-scale))", fontWeight: 700, color: "var(--app-text)", marginBottom: 10 }}>
            Parece que estás pasando por algo difícil
          </h2>
          <p style={{ fontSize: "calc(14px * var(--app-font-scale))", color: "var(--app-text-muted)", lineHeight: 1.7, marginBottom: 24 }}>
            Estamos aquí contigo. Estas opciones pueden ayudarte ahora mismo.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={onGoToHelp}
              className="w-full py-3.5 rounded-xl transition-all"
              style={{ background: "#5B88B2", color: "#fff", fontWeight: 600, fontSize: "calc(15px * var(--app-font-scale))" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#4a76a0")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#5B88B2")}
            >Hablar con un psicólogo</button>
            <button
              onClick={onGoToHelp}
              className="w-full py-3.5 rounded-xl transition-all"
              style={{ border: "1px solid rgba(226,75,74,0.4)", color: "#E24B4A", background: "transparent", fontWeight: 600, fontSize: "calc(15px * var(--app-font-scale))" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(226,75,74,0.08)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >Ver líneas de crisis</button>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--app-text-muted)", fontSize: "calc(13px * var(--app-font-scale))", marginTop: 4 }}
            >Volver al chat</button>
          </div>
        </div>
      </div>
    </div>
  );
}
