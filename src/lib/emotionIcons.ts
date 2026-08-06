import happyIcon from "@/assets/emoji-feliz-pixel.png";
import sadIcon from "@/assets/emoji-triste-pixel.png";
import worriedIcon from "@/assets/emoji-ansiedad-pixel.png";
import angryIcon from "@/assets/emoji-enojo-pixel.png";
import calmIcon from "@/assets/emoji-calma-pixel.png";
import tiredIcon from "@/assets/emoji-agotamiento-pixel.png";
import neutralIcon from "@/assets/emoji-neutral-pixel.png";
import supportIcon from "@/assets/emoji-apoyo-pixel.png";
import groupIcon from "@/assets/generated-icons/009-grupo.png";
import strengthIcon from "@/assets/emoji-fuerza-pixel.png";
import breathingIcon from "@/assets/emoji-meditacion-pixel.png";
import sleepingIcon from "@/assets/emoji-dormido-pixel.png";
import lowEnergyIcon from "@/assets/emoji-baja-energia-pixel.png";
import anchorIcon from "@/assets/generated-icons/anclaje.png";
import streakIcon from "@/assets/generated-icons/racha.png";
import streakInactiveIcon from "@/assets/generated-icons/racha-gris.png";
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
  sleeping: sleepingIcon,
  lowEnergy: lowEnergyIcon,
  anchor: anchorIcon,
  streak: streakIcon,
  streakInactive: streakInactiveIcon,
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
  Meditación: breathingIcon,
  "🧘": breathingIcon,
  Agotamiento: tiredIcon,
  Cansancio: lowEnergyIcon,
  "😩": tiredIcon,
  "😴": sleepingIcon,
  Neutral: neutralIcon,
  "😐": neutralIcon,
  Apoyo: supportIcon,
  "🤗": supportIcon,
  Fuerza: strengthIcon,
  "💪": strengthIcon,
};

export function getEmotionIcon(value?: string | null): string | null {
  if (!value) return null;
  return iconByEmotion[value] ?? null;
}
