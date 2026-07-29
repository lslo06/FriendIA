import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import type { UserProfile } from "@/lib/types";
import { Logo } from "./Logo";
import { emotionIcons } from "@/lib/emotionIcons";

interface SurveyProps {
  userName: string;
  initialProfile?: UserProfile | null;
  onComplete: (data: SurveyData) => void;
}

export interface SurveyData {
  name: string;
  apellido_pat: string;
  apellido_mat: string;
  gender: string;
  disability: string;
  concerns: string[];
  cycleSensitive?: string;
  tone: string;
}

const concerns = [
  "Estrés laboral",
  "Relaciones",
  "Ansiedad",
  "Tristeza",
  "Autoestima",
  "Sueño",
  "Identidad",
  "Otro",
];

const tones = [
  {
    icon: emotionIcons.support,
    label: "Cálido y amistoso",
    desc: "Como hablar con un amigo cercano",
  },
  {
    icon: emotionIcons.calm,
    label: "Calmado y neutro",
    desc: "Reflexivo y sin juicios",
  },
  {
    icon: emotionIcons.strength,
    label: "Motivador",
    desc: "Te impulsa a seguir adelante",
  },
];

function hasSavedPersonalData(profile?: UserProfile | null) {
  return Boolean(
    profile?.nombre?.trim() &&
      profile.apellido_pat?.trim() &&
      profile.apellido_mat?.trim()
  );
}

export function Survey({
  userName,
  initialProfile,
  onComplete,
}: SurveyProps) {
  const [step, setStep] = useState(() =>
    hasSavedPersonalData(initialProfile) ? 2 : 1
  );
  const [error, setError] = useState("");

  const [data, setData] = useState<SurveyData>(() => ({
    name: initialProfile?.nombre?.trim() || userName,
    apellido_pat: initialProfile?.apellido_pat?.trim() || "",
    apellido_mat: initialProfile?.apellido_mat?.trim() || "",
    gender: initialProfile?.genero || "",
    disability: "",
    concerns: initialProfile?.preocupaciones ?? [],
    tone: initialProfile?.tono_preferido || "",
  }));

  useEffect(() => {
    if (!initialProfile) return;

    setData((current) => ({
      ...current,
      name: current.name.trim() || initialProfile.nombre?.trim() || userName,
      apellido_pat:
        current.apellido_pat.trim() || initialProfile.apellido_pat?.trim() || "",
      apellido_mat:
        current.apellido_mat.trim() || initialProfile.apellido_mat?.trim() || "",
      gender: current.gender || initialProfile.genero || "",
      concerns:
        current.concerns.length > 0
          ? current.concerns
          : initialProfile.preocupaciones ?? [],
      tone: current.tone || initialProfile.tono_preferido || "",
    }));

    if (hasSavedPersonalData(initialProfile)) {
      setStep((current) => (current === 1 ? 2 : current));
      setError("");
    }
  }, [initialProfile, userName]);

  const totalSteps = data.gender === "Mujer" ? 6 : 5;

  const stepLabels = [
    "Nombre",
    "Género",
    "Discapacidad",
    "Preocupaciones",
    ...(data.gender === "Mujer" ? ["Ciclo"] : []),
    "Tono",
  ];

  const progress = (step / totalSteps) * 100;

  function nextStep() {
    setError("");

    if (step === 1) {
      if (
        !data.name.trim() ||
        !data.apellido_pat.trim() ||
        !data.apellido_mat.trim()
      ) {
        setError("Debes ingresar tu nombre y tus dos apellidos.");
        return;
      }
    }

    if (step < totalSteps) {
      setStep((s) => s + 1);
    } else {
      onComplete(data);
    }
  }

  function prevStep() {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  }

  function skip() {
    if (step === 1) return;
    nextStep();
  }

  function updateData<K extends keyof SurveyData>(
    field: K,
    value: SurveyData[K]
  ) {
    setData((current) => ({
      ...current,
      [field]: value,
    }));

    if (step === 1) {
      setError("");
    }
  }

  const inputStyle = {
    background: "#0F1825",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#E2E8F0",
    fontSize: 15,
  };

  const labelStyle = {
    display: "block",
    color: "#94A3B8",
    fontSize: 13,
    marginBottom: 6,
  };

  function renderStep() {
    const actualStep =
      data.gender === "Mujer"
        ? step
        : step < 5
          ? step
          : step + 1;

    switch (actualStep) {
      case 1:
        return (
          <div>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#E2E8F0",
                marginBottom: 8,
              }}
            >
              ¿Cómo te gustaría que te llamemos?
            </h2>

            <p
              style={{
                fontSize: 14,
                color: "#94A3B8",
                marginBottom: 28,
              }}
            >
              Ingresa tu nombre y apellidos para personalizar tu experiencia.
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label style={labelStyle}>Nombre</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) =>
                    updateData("name", e.target.value)
                  }
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "#5B88B2")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor =
                      "rgba(255,255,255,0.1)")
                  }
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Apellido paterno
                </label>
                <input
                  type="text"
                  value={data.apellido_pat}
                  onChange={(e) =>
                    updateData("apellido_pat", e.target.value)
                  }
                  placeholder="Tu apellido paterno"
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "#5B88B2")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor =
                      "rgba(255,255,255,0.1)")
                  }
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Apellido materno
                </label>
                <input
                  type="text"
                  value={data.apellido_mat}
                  onChange={(e) =>
                    updateData("apellido_mat", e.target.value)
                  }
                  placeholder="Tu apellido materno"
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "#5B88B2")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor =
                      "rgba(255,255,255,0.1)")
                  }
                />
              </div>
            </div>

            {error && (
              <p
                style={{
                  color: "#E24B4A",
                  fontSize: 13,
                  marginTop: 14,
                }}
              >
                {error}
              </p>
            )}
          </div>
        );

      case 2:
        return (
          <div>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#E2E8F0",
                marginBottom: 8,
              }}
            >
              ¿Con qué género te identificas?
            </h2>

            <p
              style={{
                fontSize: 14,
                color: "#94A3B8",
                marginBottom: 28,
              }}
            >
              Esta información nos ayuda a personalizar tu experiencia.
            </p>

            <div className="flex flex-wrap gap-3">
              {[
                "Mujer",
                "Hombre",
                "No binario o género diverso",
                "Prefiero no decir",
              ].map((opt) => (
                <button
                  key={opt}
                  onClick={() => updateData("gender", opt)}
                  className="px-5 py-3 rounded-full transition-all"
                  style={{
                    background:
                      data.gender === opt
                        ? "#5B88B2"
                        : "#0F1825",
                    border: `1px solid ${
                      data.gender === opt
                        ? "#5B88B2"
                        : "rgba(255,255,255,0.1)"
                    }`,
                    color:
                      data.gender === opt
                        ? "#fff"
                        : "#94A3B8",
                    fontSize: 14,
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#E2E8F0",
                marginBottom: 8,
              }}
            >
              ¿Tienes alguna discapacidad que debamos considerar?
            </h2>

            <p
              style={{
                fontSize: 14,
                color: "#94A3B8",
                marginBottom: 28,
              }}
            >
              Queremos asegurarnos de que la experiencia sea accesible para ti.
            </p>

            <div className="flex flex-wrap gap-3">
              {[
                "Visual",
                "Auditiva",
                "Motriz",
                "Ninguna",
                "Prefiero no decir",
              ].map((opt) => (
                <button
                  key={opt}
                  onClick={() =>
                    updateData("disability", opt)
                  }
                  className="px-5 py-3 rounded-full transition-all"
                  style={{
                    background:
                      data.disability === opt
                        ? "#5B88B2"
                        : "#0F1825",
                    border: `1px solid ${
                      data.disability === opt
                        ? "#5B88B2"
                        : "rgba(255,255,255,0.1)"
                    }`,
                    color:
                      data.disability === opt
                        ? "#fff"
                        : "#94A3B8",
                    fontSize: 14,
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#E2E8F0",
                marginBottom: 8,
              }}
            >
              ¿Cuáles son tus principales preocupaciones?
            </h2>

            <p
              style={{
                fontSize: 14,
                color: "#94A3B8",
                marginBottom: 28,
              }}
            >
              Puedes elegir varias.
            </p>

            <div className="flex flex-wrap gap-3">
              {concerns.map((opt) => {
                const selected =
                  data.concerns.includes(opt);

                return (
                  <button
                    key={opt}
                    onClick={() =>
                      setData((current) => ({
                        ...current,
                        concerns: selected
                          ? current.concerns.filter(
                              (item) => item !== opt
                            )
                          : [...current.concerns, opt],
                      }))
                    }
                    className="px-5 py-3 rounded-full transition-all"
                    style={{
                      background: selected
                        ? "rgba(91,136,178,0.2)"
                        : "#0F1825",
                      border: `1px solid ${
                        selected
                          ? "#5B88B2"
                          : "rgba(255,255,255,0.1)"
                      }`,
                      color: selected
                        ? "#5B88B2"
                        : "#94A3B8",
                      fontSize: 14,
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#E2E8F0",
                marginBottom: 8,
              }}
            >
              ¿Sueles sentirte más sensible en ciertos momentos del mes?
            </h2>

            <p
              style={{
                fontSize: 14,
                color: "#94A3B8",
                marginBottom: 20,
              }}
            >
              Esta información nos ayuda a personalizar tu experiencia.
            </p>

            <div className="flex flex-col gap-3 mb-5">
              {[
                "Sí, frecuentemente",
                "A veces",
                "No mucho",
                "Prefiero no responder",
              ].map((opt) => (
                <button
                  key={opt}
                  onClick={() =>
                    updateData("cycleSensitive", opt)
                  }
                  className="px-5 py-3 rounded-full text-left transition-all"
                  style={{
                    background:
                      data.cycleSensitive === opt
                        ? "#5B88B2"
                        : "#0F1825",
                    border: `1px solid ${
                      data.cycleSensitive === opt
                        ? "#5B88B2"
                        : "rgba(255,255,255,0.1)"
                    }`,
                    color:
                      data.cycleSensitive === opt
                        ? "#fff"
                        : "#94A3B8",
                    fontSize: 14,
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div
              className="flex items-start gap-2 px-4 py-3 rounded-xl"
              style={{
                background: "rgba(91,136,178,0.08)",
                border:
                  "1px solid rgba(91,136,178,0.2)",
              }}
            >
              <Lock
                size={14}
                color="#5B88B2"
                style={{
                  marginTop: 2,
                  flexShrink: 0,
                }}
              />

              <p
                style={{
                  fontSize: 13,
                  color: "#94A3B8",
                }}
              >
                Esta información es completamente privada y nos ayuda a
                personalizar tu experiencia.
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#E2E8F0",
                marginBottom: 8,
              }}
            >
              ¿Con qué tono prefieres que tu Guía te hable?
            </h2>

            <p
              style={{
                fontSize: 14,
                color: "#94A3B8",
                marginBottom: 28,
              }}
            >
              Puedes cambiarlo después en Configuración.
            </p>

            <div className="flex flex-col gap-4">
              {tones.map(({ icon, label, desc }) => (
                <button
                  key={label}
                  onClick={() =>
                    updateData("tone", label)
                  }
                  className="flex items-center gap-4 p-5 rounded-2xl text-left transition-all"
                  style={{
                    background:
                      data.tone === label
                        ? "rgba(91,136,178,0.15)"
                        : "#0F1825",
                    border: `1px solid ${
                      data.tone === label
                        ? "#5B88B2"
                        : "rgba(255,255,255,0.08)"
                    }`,
                  }}
                >
                  <img src={icon} alt="" className="h-12 w-12 object-contain" />

                  <div>
                    <p
                      style={{
                        fontWeight: 600,
                        color: "#E2E8F0",
                        fontSize: 15,
                      }}
                    >
                      {label}
                    </p>

                    <p
                      style={{
                        fontSize: 13,
                        color: "#94A3B8",
                        marginTop: 2,
                      }}
                    >
                      {desc}
                    </p>
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
    <div
      className="min-h-screen flex flex-col items-center"
      style={{ background: "#121820" }}
    >
      <nav
        className="w-full flex items-center justify-center py-4"
        style={{
          borderBottom:
            "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Logo size={32} showName />
      </nav>

      <div className="w-full max-w-lg px-6 pt-12">
        <div className="mb-2 flex items-center justify-between">
          <span
            style={{
              fontSize: 13,
              color: "#94A3B8",
            }}
          >
            {stepLabels[step - 1]}
          </span>

          <span
            style={{
              fontSize: 13,
              color: "#94A3B8",
            }}
          >
            Paso {step} de {totalSteps}
          </span>
        </div>

        <div
          className="w-full h-1.5 rounded-full mb-10"
          style={{
            background: "#1E2D42",
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: "#5B88B2",
            }}
          />
        </div>

        <div
          className="p-8 rounded-2xl"
          style={{
            background: "#1A2332",
            border:
              "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {renderStep()}

          <div
            className="flex items-center justify-between mt-10 pt-6"
            style={{
              borderTop:
                "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <button
              onClick={prevStep}
              disabled={step === 1}
              style={{
                color:
                  step === 1
                    ? "#2D3F55"
                    : "#94A3B8",
                background: "none",
                border: "none",
                cursor:
                  step === 1
                    ? "not-allowed"
                    : "pointer",
                fontSize: 14,
              }}
            >
              ← Atrás
            </button>

            <div className="flex gap-3">
              {step !== 1 && (
                <button
                  onClick={skip}
                  style={{
                    color: "#94A3B8",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  Omitir
                </button>
              )}

              <button
                onClick={nextStep}
                className="px-7 py-2.5 rounded-xl transition-all"
                style={{
                  background: "#5B88B2",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "#4a76a0")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "#5B88B2")
                }
              >
                {step === totalSteps ? (
                  <span className="flex items-center gap-2">
                    Comenzar
                    <img src={emotionIcons.celebration} alt="" className="h-6 w-6 object-contain" />
                  </span>
                ) : "Siguiente"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
