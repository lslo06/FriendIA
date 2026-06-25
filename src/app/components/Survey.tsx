import { useState } from "react";
import { Lock } from "lucide-react";
import { Logo } from "./Logo";

interface SurveyProps {
  userName: string;
  onComplete: (data: SurveyData) => void;
}

export interface SurveyData {
  name: string;
  gender: string;
  disability: string;
  concerns: string[];
  cycleSensitive?: string;
  tone: string;
}

const concerns = ["Estrés laboral", "Relaciones", "Ansiedad", "Tristeza", "Autoestima", "Sueño", "Identidad", "Otro"];
const tones = [
  { emoji: "🤗", label: "Cálido y amistoso", desc: "Como hablar con un amigo cercano" },
  { emoji: "🧘", label: "Calmado y neutro", desc: "Reflexivo y sin juicios" },
  { emoji: "💪", label: "Motivador", desc: "Te impulsa a seguir adelante" },
];

export function Survey({ userName, onComplete }: SurveyProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<SurveyData>({
    name: userName,
    gender: "",
    disability: "",
    concerns: [],
    tone: "",
  });

  const totalSteps = data.gender === "Mujer" ? 6 : 5;
  const stepLabels = [
    "Nombre", "Género", "Discapacidad", "Preocupaciones",
    ...(data.gender === "Mujer" ? ["Ciclo"] : []),
    "Tono"
  ];

  function nextStep() {
    if (step < totalSteps) setStep(s => s + 1);
    else onComplete(data);
  }
  function prevStep() { setStep(s => Math.max(1, s - 1)); }
  function skip() { nextStep(); }

  const progress = (step / totalSteps) * 100;

  function renderStep() {
    const actualStep = data.gender === "Mujer" ? step : step < 5 ? step : step + 1;

    switch (actualStep) {
      case 1:
        return (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>¿Cómo te gustaría que te llamemos?</h2>
            <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 28 }}>Usaremos este nombre para personalizar tu experiencia.</p>
            <input
              value={data.name}
              onChange={e => setData(d => ({ ...d, name: e.target.value }))}
              placeholder="Tu nombre o apodo"
              className="w-full px-4 py-3 rounded-xl outline-none"
              style={{ background: "#0F1825", border: "1px solid rgba(255,255,255,0.1)", color: "#E2E8F0", fontSize: 15 }}
              onFocus={e => (e.target.style.borderColor = "#5B88B2")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>
        );
      case 2:
        return (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>¿Con qué género te identificas?</h2>
            <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 28 }}>Esta información nos ayuda a personalizar tu experiencia.</p>
            <div className="flex flex-wrap gap-3">
              {["Mujer", "Hombre", "No binario o género diverso", "Prefiero no decir"].map(opt => (
                <button
                  key={opt}
                  onClick={() => setData(d => ({ ...d, gender: opt }))}
                  className="px-5 py-3 rounded-full transition-all"
                  style={{
                    background: data.gender === opt ? "#5B88B2" : "#0F1825",
                    border: `1px solid ${data.gender === opt ? "#5B88B2" : "rgba(255,255,255,0.1)"}`,
                    color: data.gender === opt ? "#fff" : "#94A3B8",
                    fontSize: 14,
                  }}
                >{opt}</button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>¿Tienes alguna discapacidad que debamos considerar?</h2>
            <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 28 }}>Queremos asegurarnos de que la experiencia sea accesible para ti.</p>
            <div className="flex flex-wrap gap-3">
              {["Visual", "Auditiva", "Motriz", "Ninguna", "Prefiero no decir"].map(opt => (
                <button
                  key={opt}
                  onClick={() => setData(d => ({ ...d, disability: opt }))}
                  className="px-5 py-3 rounded-full transition-all"
                  style={{
                    background: data.disability === opt ? "#5B88B2" : "#0F1825",
                    border: `1px solid ${data.disability === opt ? "#5B88B2" : "rgba(255,255,255,0.1)"}`,
                    color: data.disability === opt ? "#fff" : "#94A3B8",
                    fontSize: 14,
                  }}
                >{opt}</button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>¿Cuáles son tus principales preocupaciones?</h2>
            <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 28 }}>Puedes elegir varias.</p>
            <div className="flex flex-wrap gap-3">
              {concerns.map(opt => {
                const selected = data.concerns.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => setData(d => ({
                      ...d,
                      concerns: selected ? d.concerns.filter(c => c !== opt) : [...d.concerns, opt]
                    }))}
                    className="px-5 py-3 rounded-full transition-all"
                    style={{
                      background: selected ? "rgba(91,136,178,0.2)" : "#0F1825",
                      border: `1px solid ${selected ? "#5B88B2" : "rgba(255,255,255,0.1)"}`,
                      color: selected ? "#5B88B2" : "#94A3B8",
                      fontSize: 14,
                    }}
                  >{opt}</button>
                );
              })}
            </div>
          </div>
        );
      case 5:
        return (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>¿Sueles sentirte más sensible en ciertos momentos del mes?</h2>
            <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 20 }}>Esta información nos ayuda a personalizar tu experiencia.</p>
            <div className="flex flex-col gap-3 mb-5">
              {["Sí, frecuentemente", "A veces", "No mucho", "Prefiero no responder"].map(opt => (
                <button
                  key={opt}
                  onClick={() => setData(d => ({ ...d, cycleSensitive: opt }))}
                  className="px-5 py-3 rounded-full text-left transition-all"
                  style={{
                    background: data.cycleSensitive === opt ? "#5B88B2" : "#0F1825",
                    border: `1px solid ${data.cycleSensitive === opt ? "#5B88B2" : "rgba(255,255,255,0.1)"}`,
                    color: data.cycleSensitive === opt ? "#fff" : "#94A3B8",
                    fontSize: 14,
                  }}
                >{opt}</button>
              ))}
            </div>
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl" style={{ background: "rgba(91,136,178,0.08)", border: "1px solid rgba(91,136,178,0.2)" }}>
              <Lock size={14} color="#5B88B2" style={{ marginTop: 2, flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: "#94A3B8" }}>Esta información es completamente privada y nos ayuda a personalizar tu experiencia.</p>
            </div>
          </div>
        );
      case 6:
        return (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>¿Con qué tono prefieres que tu Guía te hable?</h2>
            <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 28 }}>Puedes cambiarlo después en Configuración.</p>
            <div className="flex flex-col gap-4">
              {tones.map(({ emoji, label, desc }) => (
                <button
                  key={label}
                  onClick={() => setData(d => ({ ...d, tone: label }))}
                  className="flex items-center gap-4 p-5 rounded-2xl text-left transition-all"
                  style={{
                    background: data.tone === label ? "rgba(91,136,178,0.15)" : "#0F1825",
                    border: `1px solid ${data.tone === label ? "#5B88B2" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  <span style={{ fontSize: 28 }}>{emoji}</span>
                  <div>
                    <p style={{ fontWeight: 600, color: "#E2E8F0", fontSize: 15 }}>{label}</p>
                    <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 2 }}>{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center" style={{ background: "#121820" }}>
      {/* Nav */}
      <nav className="w-full flex items-center justify-center py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Logo size={32} showName />
      </nav>

      <div className="w-full max-w-lg px-6 pt-12">
        {/* Progress */}
        <div className="mb-2 flex items-center justify-between">
          <span style={{ fontSize: 13, color: "#94A3B8" }}>{stepLabels[step - 1]}</span>
          <span style={{ fontSize: 13, color: "#94A3B8" }}>Paso {step} de {totalSteps}</span>
        </div>
        <div className="w-full h-1.5 rounded-full mb-10" style={{ background: "#1E2D42" }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: "#5B88B2" }} />
        </div>

        <div
          className="p-8 rounded-2xl"
          style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {renderStep()}

          <div className="flex items-center justify-between mt-10 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button
              onClick={prevStep}
              disabled={step === 1}
              style={{ color: step === 1 ? "#2D3F55" : "#94A3B8", background: "none", border: "none", cursor: step === 1 ? "not-allowed" : "pointer", fontSize: 14 }}
            >← Atrás</button>

            <div className="flex gap-3">
              <button
                onClick={skip}
                style={{ color: "#94A3B8", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}
              >Omitir</button>
              <button
                onClick={nextStep}
                className="px-7 py-2.5 rounded-xl transition-all"
                style={{ background: "#5B88B2", color: "#fff", fontWeight: 600, fontSize: 14 }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#4a76a0")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#5B88B2")}
              >{step === totalSteps ? "Comenzar 🎉" : "Siguiente"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
