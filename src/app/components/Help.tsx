import { useEffect, useState } from "react";
import { Phone, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Psicologo {
  id_psicologo: string;
  nombre_completo: string;
  especialidad: string | null;
  biografia: string | null;
  url_contacto: string | null;
  url_avatar: string | null;
  esta_activo: boolean | null;
  creado_en: string | null;
}

export function Help() {
  const [psychologists, setPsychologists] = useState<Psicologo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =========================================================
  // CARGAR PSICÓLOGOS DESDE SUPABASE
  // =========================================================
  useEffect(() => {
    const cargarPsicologos = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .schema("Group_By")
          .from("psicologos")
          .select(
            `
            id_psicologo,
            nombre_completo,
            especialidad,
            biografia,
            url_contacto,
            url_avatar,
            esta_activo,
            creado_en
          `,
          )
          .eq("esta_activo", true)
          .order("creado_en", { ascending: false });

        if (error) {
          throw error;
        }

        setPsychologists(data ?? []);
      } catch (err) {
        console.error("Error cargando psicólogos:", err);

        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los psicólogos.",
        );
      } finally {
        setLoading(false);
      }
    };

    cargarPsicologos();
  }, []);

  // =========================================================
  // OBTENER INICIALES DEL NOMBRE
  // =========================================================
  const obtenerIniciales = (nombre: string) => {
    return nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((palabra) => palabra.charAt(0).toUpperCase())
      .join("");
  };

  // =========================================================
  // ABRIR URL DE CONTACTO
  // =========================================================
  const contactarPsicologo = (url: string | null) => {
    if (!url) return;

    // Para URLs normales
    if (/^https?:\/\//i.test(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    // Para tel:, mailto:, etc.
    window.location.href = url;
  };

  return (
    <div
      className="flex-1 overflow-y-auto p-8"
      style={{ background: "var(--app-bg)" }}
    >
      <h1
        style={{
          fontSize: "calc(24px * var(--app-font-scale))",
          fontWeight: 700,
          color: "var(--app-text)",
          marginBottom: 24,
        }}
      >
        Ayuda y apoyo
      </h1>

      {/* =====================================================
          LÍNEAS DE CRISIS
      ====================================================== */}
      <div
        className="p-5 rounded-2xl mb-8"
        style={{
          border: "1px solid rgba(226,75,74,0.35)",
          background: "rgba(226,75,74,0.06)",
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle size={20} color="#E24B4A" />

          <h2
            style={{
              fontSize: "calc(16px * var(--app-font-scale))",
              fontWeight: 600,
              color: "var(--app-text)",
            }}
          >
            Líneas de crisis
          </h2>
        </div>

        <p
          style={{
            fontSize: "calc(13px * var(--app-font-scale))",
            color: "var(--app-text-muted)",
            marginBottom: 14,
          }}
        >
          Si estás pasando por una situación de emergencia emocional, estas
          líneas están disponibles 24/7.
        </p>

        <div className="flex gap-3 flex-wrap">
          {[
            ["SAPTEL", "55 5259-8121"],
            ["CONASAMA", "800-290-0024"],
          ].map(([name, num]) => (
            <a
              key={name}
              href={`tel:${num.replace(/\D/g, "")}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
              style={{
                background: "rgba(226,75,74,0.12)",
                border: "1px solid rgba(226,75,74,0.3)",
                color: "#E24B4A",
                fontWeight: 600,
                fontSize: "calc(13px * var(--app-font-scale))",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(226,75,74,0.2)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(226,75,74,0.12)")
              }
            >
              <Phone size={14} />
              {name}: {num}
            </a>
          ))}
        </div>
      </div>

      {/* =====================================================
          PSICÓLOGOS
      ====================================================== */}
      <h2
        style={{
          fontSize: "calc(16px * var(--app-font-scale))",
          fontWeight: 600,
          color: "var(--app-text)",
          marginBottom: 14,
        }}
      >
        Psicólogos disponibles
      </h2>

      {/* CARGANDO */}
      {loading && (
        <div
          className="flex items-center justify-center gap-3 py-10"
          style={{ color: "var(--app-text-muted)" }}
        >
          <Loader2 className="animate-spin" size={22} />

          <span
            style={{
              fontSize: "calc(13px * var(--app-font-scale))",
            }}
          >
            Cargando psicólogos...
          </span>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div
          className="p-4 rounded-2xl mb-8"
          style={{
            background: "rgba(226,75,74,0.06)",
            border: "1px solid rgba(226,75,74,0.3)",
            color: "#E24B4A",
            fontSize: "calc(13px * var(--app-font-scale))",
          }}
        >
          Error al cargar psicólogos: {error}
        </div>
      )}

      {/* NO HAY PSICÓLOGOS */}
      {!loading && !error && psychologists.length === 0 && (
        <div
          className="p-5 rounded-2xl mb-8 text-center"
          style={{
            background: "var(--app-surface)",
            border: "1px solid var(--app-border)",
            color: "var(--app-text-muted)",
          }}
        >
          No hay psicólogos disponibles actualmente.
        </div>
      )}

      {/* LISTA DE PSICÓLOGOS */}
      {!loading && !error && psychologists.length > 0 && (
        <div className="flex flex-col gap-4 mb-8">
          {psychologists.map((psychologist) => {
            // Como especialidad es TEXT, podemos guardar:
            // "Ansiedad, Duelo, Relaciones"
            // y aquí convertirlo en un arreglo.
            const especialidades =
              psychologist.especialidad
                ?.split(",")
                .map((especialidad) => especialidad.trim())
                .filter(Boolean) ?? [];

            return (
              <div
                key={psychologist.id_psicologo}
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{
                  background: "var(--app-surface)",
                  border: "1px solid var(--app-border)",
                }}
              >
                {/* AVATAR */}
                {psychologist.url_avatar ? (
                  <img
                    src={psychologist.url_avatar}
                    alt={psychologist.nombre_completo}
                    className="w-12 h-12 rounded-full flex-shrink-0"
                    style={{
                      objectFit: "cover",
                      border: "1px solid var(--app-border)",
                    }}
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(91,136,178,0.15)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "calc(15px * var(--app-font-scale))",
                        fontWeight: 700,
                        color: "#5B88B2",
                      }}
                    >
                      {obtenerIniciales(psychologist.nombre_completo)}
                    </span>
                  </div>
                )}

                {/* INFORMACIÓN */}
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "calc(15px * var(--app-font-scale))",
                      fontWeight: 600,
                      color: "var(--app-text)",
                      marginBottom: 6,
                    }}
                  >
                    {psychologist.nombre_completo}
                  </p>

                  {/* ESPECIALIDADES */}
                  {especialidades.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {especialidades.map((especialidad) => (
                        <span
                          key={especialidad}
                          className="px-2 py-0.5 rounded-full"
                          style={{
                            fontSize: "calc(11px * var(--app-font-scale))",
                            background: "rgba(148,163,184,0.1)",
                            color: "var(--app-text-muted)",
                          }}
                        >
                          {especialidad}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* BIOGRAFÍA */}
                  {psychologist.biografia && (
                    <p
                      style={{
                        marginTop: 8,
                        fontSize: "calc(12px * var(--app-font-scale))",
                        color: "var(--app-text-muted)",
                        lineHeight: 1.5,
                      }}
                    >
                      {psychologist.biografia}
                    </p>
                  )}
                </div>

                {/* CONTACTAR */}
                <button
                  type="button"
                  disabled={!psychologist.url_contacto}
                  onClick={() => contactarPsicologo(psychologist.url_contacto)}
                  className="px-4 py-2 rounded-xl flex-shrink-0 transition-all"
                  style={{
                    background: psychologist.url_contacto
                      ? "#5B88B2"
                      : "#94A3B8",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "calc(13px * var(--app-font-scale))",
                    cursor: psychologist.url_contacto
                      ? "pointer"
                      : "not-allowed",
                    opacity: psychologist.url_contacto ? 1 : 0.6,
                  }}
                  onMouseEnter={(e) => {
                    if (psychologist.url_contacto) {
                      (e.currentTarget as HTMLElement).style.background =
                        "#4a76a0";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (psychologist.url_contacto) {
                      (e.currentTarget as HTMLElement).style.background =
                        "#5B88B2";
                    }
                  }}
                >
                  Contactar
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================
          DISCLAIMER
      ====================================================== */}
      <div
        className="p-4 rounded-2xl"
        style={{
          background: "var(--app-surface)",
          border: "1px solid var(--app-border)",
        }}
      >
        <p
          style={{
            fontSize: "calc(13px * var(--app-font-scale))",
            color: "var(--app-text-muted)",
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          FriendIA no sustituye la atención psicológica profesional.
          <br />
          Ante cualquier emergencia, busca apoyo de un profesional de salud
          mental.
        </p>
      </div>
    </div>
  );
}
