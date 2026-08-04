import { format, isToday, isYesterday, startOfDay, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "./supabase";
import { getProfileId } from "./profiles";
import type { DiaryEntry, DiaryStats } from "./types";

export const MOOD_TAGS: Record<string, string> = {
  "😊": "Bienestar",
  "😐": "Neutral",
  "😔": "Tristeza",
  "😤": "Estrés",
  "😰": "Ansiedad",
  "💪": "Fuerza",
};

export const MOOD_OPTIONS = [
  { emoji: "😊", label: "Bienestar", score: 5 },
  { emoji: "💪", label: "Fuerza", score: 4 },
  { emoji: "😐", label: "Neutral", score: 3 },
  { emoji: "😔", label: "Tristeza", score: 2 },
  { emoji: "😰", label: "Ansiedad", score: 2 },
  { emoji: "😤", label: "Estrés", score: 1 },
] as const;

export const TAG_COLORS: Record<string, string> = {
  Bienestar: "#4CD964",
  Neutral: "#94A3B8",
  Tristeza: "#5B88B2",
  Estrés: "#F5A623",
  Ansiedad: "#F5A623",
  Fuerza: "#A78BFA",
  Calma: "#5B88B2",
  Conexión: "#A78BFA",
  Cansancio: "#94A3B8",
  Alegría: "#4CD964",
  Enojo: "#E24B4A",
  Agotamiento: "#94A3B8",
};

export function getTagColor(tag: string | null): string {
  if (!tag) return "#94A3B8";
  return TAG_COLORS[tag] ?? "#94A3B8";
}

export function formatEntryDate(dateStr: string): string {
  const date = new Date(dateStr);
  const time = format(date, "h:mm a", { locale: es });
  if (isToday(date)) return `Hoy, ${time}`;
  if (isYesterday(date)) return `Ayer, ${time}`;
  return format(date, "EEE d MMM, h:mm a", { locale: es });
}

interface DiaryRow {
  id_entrada_diario: string;
  id_perfil: string;
  contenido: string;
  etiquetas: string[] | null;
  puntuacion_animo: number | null;
  creado_en: string;
}

function getMoodEmoji(score: number | null, tag: string | null): string | null {
  if (tag) {
    const option = MOOD_OPTIONS.find(item => item.label === tag);
    if (option) return option.emoji;
  }

  if (score === null) return null;
  if (score >= 5) return "😊";
  if (score === 4) return "💪";
  if (score === 3) return "😐";
  if (score === 2) return "😔";
  return "😤";
}

function mapDiaryEntry(entry: DiaryRow): DiaryEntry {
  const tag = Array.isArray(entry.etiquetas) && entry.etiquetas.length > 0
    ? entry.etiquetas[0]
    : null;

  return {
    id: entry.id_entrada_diario,
    user_id: entry.id_perfil,
    text: entry.contenido,
    mood: getMoodEmoji(entry.puntuacion_animo, tag),
    mood_score: entry.puntuacion_animo,
    tag,
    created_at: entry.creado_en,
  };
}

export async function fetchDiaryEntries(userId: string): Promise<DiaryEntry[]> {
  const profileId = await getProfileId(userId);
  if (!profileId) return [];

  const { data, error } = await supabase
    .schema("Group_By")
    .from("entradas_diario")
    .select("id_entrada_diario,id_perfil,contenido,etiquetas,puntuacion_animo,creado_en")
    .eq("id_perfil", profileId)
    .order("creado_en", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as DiaryRow[]).map(mapDiaryEntry);
}

export async function createDiaryEntry(
  userId: string,
  entry: { text: string; mood?: string; tag?: string }
): Promise<DiaryEntry> {
  if (!entry.mood && !entry.tag) throw new Error("Selecciona una emoción");
  const profileId = await getProfileId(userId);
  if (!profileId) throw new Error("Perfil no encontrado");

  const moodOption = entry.mood
    ? MOOD_OPTIONS.find(option => option.emoji === entry.mood)
    : undefined;
  const tag = entry.tag ?? moodOption?.label;
  const etiquetas = tag ? [tag] : [];

  const { data, error } = await supabase
    .schema("Group_By")
    .from("entradas_diario")
    .insert({
      id_perfil: profileId,
      contenido: entry.text,
      etiquetas,
      puntuacion_animo: moodOption?.score ?? null,
      esta_fijado: false,
    })
    .select("id_entrada_diario,id_perfil,contenido,etiquetas,puntuacion_animo,creado_en")
    .single();

  if (error) throw error;
  return mapDiaryEntry(data as DiaryRow);
}

export async function updateDiaryEntry(
  userId: string,
  entryId: string,
  entry: { text: string; mood?: string; tag?: string }
): Promise<DiaryEntry> {
  if (!entry.mood && !entry.tag) throw new Error("Selecciona una emoción");
  const profileId = await getProfileId(userId);
  if (!profileId) throw new Error("Perfil no encontrado");

  const text = entry.text.trim();
  if (!text) throw new Error("La entrada no puede estar vacía");

  const moodOption = entry.mood
    ? MOOD_OPTIONS.find(option => option.emoji === entry.mood)
    : undefined;
  const tag = entry.tag ?? moodOption?.label;

  const { data, error } = await supabase
    .schema("Group_By")
    .from("entradas_diario")
    .update({
      contenido: text,
      etiquetas: tag ? [tag] : [],
      puntuacion_animo: moodOption?.score ?? null,
    })
    .eq("id_entrada_diario", entryId)
    .eq("id_perfil", profileId)
    .select("id_entrada_diario,id_perfil,contenido,etiquetas,puntuacion_animo,creado_en")
    .single();

  if (error) throw error;
  return mapDiaryEntry(data as DiaryRow);
}

export async function deleteDiaryEntry(
  userId: string,
  entryId: string
): Promise<void> {
  const profileId = await getProfileId(userId);
  if (!profileId) throw new Error("Perfil no encontrado");

  const { error } = await supabase
    .schema("Group_By")
    .from("entradas_diario")
    .delete()
    .eq("id_entrada_diario", entryId)
    .eq("id_perfil", profileId);

  if (error) throw error;
}

export function filterEntries(
  entries: DiaryEntry[],
  filter: "todos" | "semana" | "mes"
): DiaryEntry[] {
  if (filter === "todos") return entries;

  const now = new Date();
  const cutoff = filter === "semana" ? subDays(now, 7) : subDays(now, 30);
  return entries.filter(e => new Date(e.created_at) >= cutoff);
}

export function computeDiaryStats(entries: DiaryEntry[]): DiaryStats {
  if (entries.length === 0) {
    return { activeDays: 0, totalEntries: 0, currentStreak: 0 };
  }

  const daySet = new Set(
    entries.map(entry => format(new Date(entry.created_at), "yyyy-MM-dd"))
  );

  let streak = 0;
  let day = startOfDay(new Date());
  while (daySet.has(format(day, "yyyy-MM-dd"))) {
    streak++;
    day = subDays(day, 1);
  }

  if (streak === 0) {
    day = subDays(startOfDay(new Date()), 1);
    while (daySet.has(format(day, "yyyy-MM-dd"))) {
      streak++;
      day = subDays(day, 1);
    }
  }

  return {
    activeDays: daySet.size,
    totalEntries: entries.length,
    currentStreak: streak,
  };
}
