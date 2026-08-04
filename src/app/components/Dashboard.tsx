import { useEffect, useState } from "react";
import { MessageCircle, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  fetchDiaryEntries,
  formatEntryDate,
  getTagColor,
} from "@/lib/diary";
import {
  computeDashboardStats,
  computeWeekMoods,
  createEmotionRecord,
  EMOTION_COLORS,
  fetchEmotionRecords,
  isEmotionFromToday,
} from "@/lib/emotions";
import type { DiaryEntry, EmotionRecord } from "@/lib/types";
import { emotionIcons, getEmotionIcon } from "@/lib/emotionIcons";

interface DashboardProps {
  userId: string;
  userName: string;
  onOpenChat: () => void;
  onOpenDiary: () => void;
}

const emotionWheel = [
  {
    core: "Alegría", color: "#4CD964",
    nuances: ["Gratitud", "Satisfacción", "Esperanza", "Entusiasmo", "Serenidad"]
  },
  {
    core: "Tristeza", color: "#5B88B2",
    nuances: ["Melancolía", "Nostalgia", "Soledad", "Decepción", "Duelo"]
  },
  {
    core: "Ansiedad", color: "#F5A623",
    nuances: ["Preocupación", "Nerviosismo", "Tensión", "Inseguridad", "Miedo"]
  },
  {
    core: "Enojo", color: "#E24B4A",
    nuances: ["Frustración", "Irritación", "Indignación", "Resentimiento", "Impaciencia"]
  },
  {
    core: "Calma", color: "#A78BFA",
    nuances: ["Paz", "Aceptación", "Equilibrio", "Claridad", "Descanso"]
  },
  {
    core: "Agotamiento", color: "var(--app-text-muted)",
    nuances: ["Cansancio físico", "Saturación mental", "Desmotivación", "Vacío", "Apatía"]
  },
];

export function Dashboard({ userId, userName, onOpenChat, onOpenDiary }: DashboardProps) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [emotionRecords, setEmotionRecords] = useState<EmotionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCore, setSelectedCore] = useState<string | null>(null);
  const [selectedNuance, setSelectedNuance] = useState<string | null>(null);
  const [checkInSaved, setCheckInSaved] = useState(false);
  const [savingCheckIn, setSavingCheckIn] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      fetchDiaryEntries(userId),
      fetchEmotionRecords(userId),
    ]).then(([diaryResult, emotionResult]) => {
      if (!active) return;

      if (diaryResult.status === "fulfilled") {
        setEntries(diaryResult.value);
      }
      if (emotionResult.status === "fulfilled") {
        setEmotionRecords(emotionResult.value);
      }

      if (diaryResult.status === "rejected" || emotionResult.status === "rejected") {
        console.error("Error cargando el dashboard:", {
          diary: diaryResult.status === "rejected" ? diaryResult.reason : null,
          emotions: emotionResult.status === "rejected" ? emotionResult.reason : null,
        });
        toast.error("No se pudieron cargar todos los datos del dashboard");
      }
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [userId]);

  const stats = computeDashboardStats(entries, emotionRecords);
  const weekDays = computeWeekMoods(emotionRecords);
  const recentEntries = entries.slice(0, 3);
  const todayEmotion = emotionRecords.find(isEmotionFromToday);

  const today = new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const selectedEmotion = emotionWheel.find(e => e.core === selectedCore);

  async function saveCheckIn() {
    if (!selectedCore || !selectedNuance) return;
    setSavingCheckIn(true);
    try {
      const record = await createEmotionRecord(userId, {
        primary: selectedCore,
        nuance: selectedNuance,
      });
      setEmotionRecords(previous => [record, ...previous]);
      setCheckInSaved(true);
      setSelectedCore(null);
      setSelectedNuance(null);
      setTimeout(() => setCheckInSaved(false), 3000);
      toast.success("Check-in registrado");
    } catch (error) {
      console.error("Error guardando el check-in:", error);
      toast.error("No se pudo guardar el check-in");
    } finally {
      setSavingCheckIn(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: "var(--app-bg)" }}>
        <Loader2 size={28} color="#5B88B2" className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: "var(--app-bg)" }}>
      <div className="mb-8">
        <h1 style={{ fontSize: "calc(26px * var(--app-font-scale))", fontWeight: 700, color: "var(--app-text)" }}>Hola, {userName} </h1>
        <p style={{ fontSize: "calc(14px * var(--app-font-scale))", color: "var(--app-text-muted)", marginTop: 4, textTransform: "capitalize" }}>{today}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div style={{ background: "var(--app-surface)", borderRadius: 16, padding: "18px 20px", border: "1px solid var(--app-border)" }}>
          <p style={{ fontSize: "calc(12px * var(--app-font-scale))", color: "var(--app-text-muted)", marginBottom: 6 }}>Días activos</p>
          <p style={{ fontSize: "calc(28px * var(--app-font-scale))", fontWeight: 700, color: "#5B88B2" }}>{stats.activeDays}</p>
        </div>
        <div style={{ background: "var(--app-surface)", borderRadius: 16, padding: "18px 20px", border: "1px solid var(--app-border)" }}>
          <p style={{ fontSize: "calc(12px * var(--app-font-scale))", color: "var(--app-text-muted)", marginBottom: 6 }}>Entradas en diario</p>
          <p style={{ fontSize: "calc(28px * var(--app-font-scale))", fontWeight: 700, color: "#4CD964" }}>{stats.totalEntries}</p>
        </div>

        {/* Tarjeta de Racha actual con el asset de fuego */}
        <div style={{ background: "var(--app-surface)", borderRadius: 16, padding: "18px 20px", border: "1px solid var(--app-border)" }}>
          <p style={{ fontSize: "calc(12px * var(--app-font-scale))", color: "var(--app-text-muted)", marginBottom: 6 }}>Racha actual</p>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: "calc(28px * var(--app-font-scale))", fontWeight: 700, color: "#F5A623" }}>
              {stats.currentStreak}
            </span>
            {stats.currentStreak > 0 && (
              <img src={emotionIcons.streak} alt="Racha activa" className="w-9 h-9 object-contain" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div style={{ background: "var(--app-surface)", borderRadius: 16, padding: "20px 22px", border: "1px solid var(--app-border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize: "calc(13px * var(--app-font-scale))", color: "var(--app-text-muted)", fontWeight: 500 }}>Check-in emocional de hoy</p>
            {(checkInSaved || todayEmotion) && (
              <span style={{ fontSize: "calc(11px * var(--app-font-scale))", color: "#4CD964", fontWeight: 600 }}>✓ Guardado</span>
            )}
          </div>

          {todayEmotion && !selectedCore && (
            <div className="mb-3 px-3 py-2 rounded-lg" style={{ background: "var(--app-surface-alt)" }}>
              <span style={{ fontSize: "calc(11px * var(--app-font-scale))", color: "var(--app-text-muted)" }}>Último registro de hoy: </span>
              <span
                style={{
                  fontSize: "calc(11px * var(--app-font-scale))",
                  color: EMOTION_COLORS[todayEmotion.primary_emotion] ?? "var(--app-text)",
                  fontWeight: 600,
                }}
              >
                {todayEmotion.primary_emotion}
                {todayEmotion.emotions[0] ? ` · ${todayEmotion.emotions[0]}` : ""}
              </span>
            </div>
          )}

          {!selectedCore ? (
            <>
              <p style={{ fontSize: "calc(12px * var(--app-font-scale))", color: "var(--app-text-muted)", marginBottom: 12, lineHeight: 1.5 }}>¿Cuál de estas emociones se acerca más a cómo te sientes?</p>
              <div className="grid grid-cols-3 gap-2">
                {emotionWheel.map(({ core, color }) => (
                  <button
                    key={core}
                    onClick={() => { setSelectedCore(core); setSelectedNuance(null); }}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all"
                    style={{ background: "var(--app-surface-alt)", border: "1px solid var(--app-border)" }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = color)}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "var(--app-border)")}
                  >
                    <img src={getEmotionIcon(core) ?? ""} alt="" className="h-16 w-16 object-contain" style={{ imageRendering: "pixelated" }} />
                    <span style={{ fontSize: "calc(11px * var(--app-font-scale))", color, fontWeight: 600 }}>{core}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => { setSelectedCore(null); setSelectedNuance(null); }}
                  style={{ fontSize: "calc(12px * var(--app-font-scale))", color: "var(--app-text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>← Cambiar</button>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: `${selectedEmotion!.color}18`, border: `1px solid ${selectedEmotion!.color}40` }}>
                  <img src={getEmotionIcon(selectedCore) ?? ""} alt="" className="h-8 w-8 object-contain" style={{ imageRendering: "pixelated" }} />
                  <span style={{ fontSize: "calc(12px * var(--app-font-scale))", color: selectedEmotion!.color, fontWeight: 600 }}>{selectedCore}</span>
                </div>
              </div>
              <p style={{ fontSize: "calc(12px * var(--app-font-scale))", color: "var(--app-text-muted)", marginBottom: 10 }}>¿Puedes afinar un poco más?</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedEmotion!.nuances.map(n => (
                  <button
                    key={n}
                    onClick={() => setSelectedNuance(n)}
                    className="px-3 py-1.5 rounded-full transition-all text-xs"
                    style={{
                      background: selectedNuance === n ? `${selectedEmotion!.color}20` : "var(--app-surface-alt)",
                      border: `1px solid ${selectedNuance === n ? selectedEmotion!.color : "var(--app-border-medium)"}`,
                      color: selectedNuance === n ? selectedEmotion!.color : "var(--app-text-muted)",
                      fontWeight: selectedNuance === n ? 600 : 400,
                    }}
                  >{n}</button>
                ))}
              </div>
              <button
                onClick={saveCheckIn}
                disabled={!selectedNuance || savingCheckIn}
                className="w-full py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                style={{
                  background: selectedNuance ? selectedEmotion!.color : "var(--app-muted)",
                  color: selectedNuance ? "#fff" : "var(--app-muted-strong)",
                  fontWeight: 600, fontSize: "calc(13px * var(--app-font-scale))",
                  opacity: savingCheckIn ? 0.7 : 1,
                }}
              >
                {savingCheckIn && <Loader2 size={14} className="animate-spin" />}
                Registrar estado
              </button>
            </>
          )}
        </div>

        <div className="flex flex-col h-full" style={{ background: "var(--app-surface)", borderRadius: 16, padding: "20px 22px", border: "1px solid var(--app-border)" }}>
          <p style={{ fontSize: "calc(13px * var(--app-font-scale))", color: "var(--app-text-muted)", marginBottom: 14, fontWeight: 500 }}>Tu semana emocional</p>
          
          {/* Contenedor flexible que centra todo el bloque para no dejar huecos enormes */}
          <div className="flex flex-col flex-1 justify-center">
            
            <div className="flex justify-between px-2">
              {weekDays.map(({ label, color, emotion }) => (
                <div
                  key={label}
                  className="relative flex flex-col items-center gap-2 cursor-default"
                  onMouseEnter={() => setHoveredDay(label)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {/* Tooltip flotante con position absolute */}
                  {hoveredDay === label && emotion && (
                    <div 
                      className="absolute z-10 px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none shadow-sm"
                      style={{ 
                        bottom: "100%", 
                        marginBottom: "8px", 
                        background: "var(--app-surface-alt)",
                        border: "1px solid var(--app-border)"
                      }}
                    >
                      <span style={{ fontSize: "calc(12px * var(--app-font-scale))", color: "var(--app-text)" }}>{label}: </span>
                      <span style={{ fontSize: "calc(12px * var(--app-font-scale))", color: color ?? "var(--app-text-muted)", fontWeight: 500 }}>
                        {emotion}
                      </span>
                    </div>
                  )}

                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background: color ?? "var(--app-muted)",
                      border: color ? "none" : "2px dashed var(--app-muted-strong)",
                      opacity: color ? 1 : 0.4,
                      transition: "transform 0.15s",
                      transform: hoveredDay === label && color ? "scale(1.15)" : "scale(1)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "calc(12px * var(--app-font-scale))",
                      color: "var(--app-text-muted)",
                      fontWeight: 500,
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Línea sutil separadora para estructurar el espacio */}
            <div className="w-full my-6" style={{ height: 1, background: "var(--app-border)", opacity: 0.6 }} />

            {/* Leyenda de emociones en formato 3x2 y más grande */}
            <div className="grid grid-cols-3 gap-y-4 gap-x-2">
              {emotionWheel.map(({ core, color }) => (
                <div key={core} className="flex items-center gap-2">
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                  <span style={{ fontSize: "calc(13px * var(--app-font-scale))", color: "var(--app-text-muted)", fontWeight: 500 }}>
                    {core}
                  </span>
                </div>
              ))}
            </div>
            
          </div>
        </div>

      </div>

      <div style={{ background: "var(--app-surface)", borderRadius: 16, padding: "20px 22px", border: "1px solid var(--app-border)", marginBottom: 20 }}>
        <div className="flex items-center justify-between mb-4">
          <p style={{ fontSize: "calc(14px * var(--app-font-scale))", fontWeight: 600, color: "var(--app-text)" }}>Entradas recientes del diario</p>
          <button onClick={onOpenDiary} style={{ fontSize: "calc(12px * var(--app-font-scale))", color: "#5B88B2", background: "none", border: "none", cursor: "pointer" }}>Ver todas →</button>
        </div>
        {recentEntries.length === 0 ? (
          <p style={{ fontSize: "calc(13px * var(--app-font-scale))", color: "var(--app-text-muted)", textAlign: "center", padding: "16px 0" }}>
            Aún no tienes entradas. ¡Escribe tu primera en el diario!
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {recentEntries.map(entry => {
              const tagColor = getTagColor(entry.tag);
              return (
                <div key={entry.id} className="flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer" style={{ background: "var(--app-surface-alt)" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--app-muted)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "var(--app-surface-alt)")}
                  onClick={onOpenDiary}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontSize: "calc(11px * var(--app-font-scale))", color: "var(--app-text-muted)" }}>{formatEntryDate(entry.created_at)}</span>
                      {entry.tag && (
                        <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "calc(10px * var(--app-font-scale))", background: `${tagColor}22`, color: tagColor, fontWeight: 600 }}>{entry.tag}</span>
                      )}
                    </div>
                    <p style={{ fontSize: "calc(13px * var(--app-font-scale))", color: "var(--app-text-muted)", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{entry.text}</p>
                  </div>
                  <ChevronRight size={14} color="var(--app-text-muted)" style={{ flexShrink: 0, marginTop: 4 }} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={onOpenChat}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl transition-all"
        style={{ background: "#5B88B2", color: "#fff", fontWeight: 600, fontSize: "calc(16px * var(--app-font-scale))" }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#4a76a0")}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#5B88B2")}
      >
        <MessageCircle size={20} />
        Hablar con mi Guía emocional
      </button>
    </div>
  );
}
