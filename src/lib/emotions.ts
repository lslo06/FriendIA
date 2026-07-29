import { format, startOfDay, subDays } from "date-fns";
import { supabase } from "./supabase";
import { getProfileId } from "./profiles";
import type {
  DiaryEntry,
  DiaryStats,
  EmotionRecord,
  WeekDayMood,
} from "./types";

export const EMOTION_COLORS: Record<string, string> = {
  Alegría: "#4CD964",
  Tristeza: "#5B88B2",
  Ansiedad: "#F5A623",
  Enojo: "#E24B4A",
  Calma: "#A78BFA",
  Agotamiento: "#94A3B8",
};

export const EMOTION_CHECKIN_OPTIONS = [
  { core: "Alegría", color: "#4CD964", emoji: "😊", nuances: ["Entusiasmo", "Gratitud", "Esperanza", "Diversión", "Satisfacción"] },
  { core: "Tristeza", color: "#5B88B2", emoji: "😔", nuances: ["Soledad", "Nostalgia", "Desánimo", "Decepción", "Vulnerabilidad"] },
  { core: "Ansiedad", color: "#F5A623", emoji: "😰", nuances: ["Preocupación", "Nerviosismo", "Tensión", "Inseguridad", "Miedo"] },
  { core: "Enojo", color: "#E24B4A", emoji: "😤", nuances: ["Frustración", "Irritación", "Impotencia", "Injusticia", "Resentimiento"] },
  { core: "Calma", color: "#A78BFA", emoji: "😌", nuances: ["Serenidad", "Alivio", "Equilibrio", "Confianza", "Claridad"] },
  { core: "Agotamiento", color: "#94A3B8", emoji: "😩", nuances: ["Cansancio", "Saturación", "Desconexión", "Pesadez", "Desgaste"] },
] as const;

const EMOTION_SCORES: Record<string, number> = {
  Alegría: 5,
  Calma: 4,
  Ansiedad: 2,
  Tristeza: 2,
  Enojo: 2,
  Agotamiento: 1,
};

interface EmotionRow {
  id_registro_emocion: string;
  id_perfil: string;
  fecha_registro: string;
  puntuacion_animo: number | null;
  etiqueta_animo: string | null;
  etiquetas_emociones: string[] | null;
  notas: string | null;
  creado_en: string;
}

function mapEmotionRecord(row: EmotionRow): EmotionRecord {
  return {
    id: row.id_registro_emocion,
    user_id: row.id_perfil,
    date: row.fecha_registro,
    mood_score: row.puntuacion_animo,
    primary_emotion: row.etiqueta_animo ?? "Sin etiqueta",
    emotions: Array.isArray(row.etiquetas_emociones)
      ? row.etiquetas_emociones
      : [],
    notes: row.notas,
    created_at: row.creado_en,
  };
}

export async function fetchEmotionRecords(userId: string): Promise<EmotionRecord[]> {
  const profileId = await getProfileId(userId);
  if (!profileId) return [];

  const { data, error } = await supabase
    .schema("Group_By")
    .from("registros_emociones")
    .select(
      "id_registro_emocion,id_perfil,fecha_registro,puntuacion_animo,etiqueta_animo,etiquetas_emociones,notas,creado_en"
    )
    .eq("id_perfil", profileId)
    .order("fecha_registro", { ascending: false })
    .order("creado_en", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as EmotionRow[]).map(mapEmotionRecord);
}

export async function createEmotionRecord(
  userId: string,
  emotion: { primary: string; nuance: string; notes?: string }
): Promise<EmotionRecord> {
  const profileId = await getProfileId(userId);
  if (!profileId) throw new Error("Perfil no encontrado");

  const primary = emotion.primary.trim();
  const nuance = emotion.nuance.trim();
  if (!primary || !nuance) {
    throw new Error("Selecciona una emoción y un matiz");
  }

  const { data, error } = await supabase
    .schema("Group_By")
    .from("registros_emociones")
    .insert({
      id_perfil: profileId,
      fecha_registro: format(new Date(), "yyyy-MM-dd"),
      puntuacion_animo: EMOTION_SCORES[primary] ?? null,
      etiqueta_animo: primary,
      etiquetas_emociones: [nuance],
      notas: emotion.notes?.trim() || null,
    })
    .select(
      "id_registro_emocion,id_perfil,fecha_registro,puntuacion_animo,etiqueta_animo,etiquetas_emociones,notas,creado_en"
    )
    .single();

  if (error) throw error;
  return mapEmotionRecord(data as EmotionRow);
}

export function computeWeekMoods(records: EmotionRecord[]): WeekDayMood[] {
  const labels = ["L", "M", "Mi", "J", "V", "S", "D"];
  const today = startOfDay(new Date());
  const todayIndex = (today.getDay() + 6) % 7;

  return labels.map((label, index) => {
    const daysAgo = todayIndex - index;
    if (daysAgo < 0) return { label, color: null, emotion: null };

    const targetDate = format(subDays(today, daysAgo), "yyyy-MM-dd");
    const record = records.find(item => item.date === targetDate);
    if (!record) return { label, color: null, emotion: null };

    return {
      label,
      color: EMOTION_COLORS[record.primary_emotion] ?? "#94A3B8",
      emotion: record.emotions[0]
        ? `${record.primary_emotion} · ${record.emotions[0]}`
        : record.primary_emotion,
    };
  });
}

export function computeDashboardStats(
  entries: DiaryEntry[],
  emotions: EmotionRecord[]
): DiaryStats {
  const activityDays = new Set<string>();

  for (const entry of entries) {
    activityDays.add(format(new Date(entry.created_at), "yyyy-MM-dd"));
  }
  for (const emotion of emotions) {
    activityDays.add(emotion.date);
  }

  let currentStreak = 0;
  let day = startOfDay(new Date());

  while (activityDays.has(format(day, "yyyy-MM-dd"))) {
    currentStreak += 1;
    day = subDays(day, 1);
  }

  if (currentStreak === 0) {
    day = subDays(startOfDay(new Date()), 1);
    while (activityDays.has(format(day, "yyyy-MM-dd"))) {
      currentStreak += 1;
      day = subDays(day, 1);
    }
  }

  return {
    activeDays: activityDays.size,
    totalEntries: entries.length,
    currentStreak,
  };
}

export function isEmotionFromToday(record: EmotionRecord): boolean {
  return record.date === format(new Date(), "yyyy-MM-dd");
}
