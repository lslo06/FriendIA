import happyIcon from "@/assets/generated-icons/002-feliz.png";
import sadIcon from "@/assets/generated-icons/001-triste.png";
import worriedIcon from "@/assets/generated-icons/003-preocupado.png";
import angryIcon from "@/assets/generated-icons/004-enojado.png";
import calmIcon from "@/assets/generated-icons/005-calma.png";
import tiredIcon from "@/assets/generated-icons/006-cansado.png";
import neutralIcon from "@/assets/generated-icons/007-neutral.png";
import supportIcon from "@/assets/generated-icons/008-apoyo.png";
import groupIcon from "@/assets/generated-icons/009-grupo.png";
import strengthIcon from "@/assets/generated-icons/fuerza.png";
import breathingIcon from "@/assets/generated-icons/respiracion.png";
import anchorIcon from "@/assets/generated-icons/anclaje.png";
import streakIcon from "@/assets/generated-icons/racha.png";
import celebrationIcon from "@/assets/generated-icons/celebracion.png";

export const emotionIcons = {
  happy: happyIcon,
  sad: sadIcon,
  worried: worriedIcon,
  angry: angryIcon,
  calm: calmIcon,
  tired: tiredIcon,
  neutral: neutralIcon,
  support: supportIcon,
  group: groupIcon,
  strength: strengthIcon,
  breathing: breathingIcon,
  anchor: anchorIcon,
  streak: streakIcon,
  celebration: celebrationIcon,
} as const;

const iconByEmotion: Record<string, string> = {
  Alegría: happyIcon,
  Bienestar: happyIcon,
  "😊": happyIcon,
  Tristeza: sadIcon,
  "😔": sadIcon,
  "😢": sadIcon,
  Ansiedad: worriedIcon,
  "😰": worriedIcon,
  Enojo: angryIcon,
  Estrés: angryIcon,
  "😤": angryIcon,
  Calma: calmIcon,
  "😌": calmIcon,
  "🧘": calmIcon,
  Agotamiento: tiredIcon,
  Cansancio: tiredIcon,
  "😩": tiredIcon,
  "😴": tiredIcon,
  Neutral: neutralIcon,
  "😐": neutralIcon,
  Fuerza: strengthIcon,
  "💪": strengthIcon,
};

export function getEmotionIcon(value?: string | null): string | null {
  if (!value) return null;
  return iconByEmotion[value] ?? null;
}
