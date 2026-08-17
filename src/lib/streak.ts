import { format, startOfDay, subDays } from "date-fns";

export const STREAK_UNLOCK_DAYS = 3;

export interface StreakProgress {
  days: number;
  daysRemaining: number;
  unlocked: boolean;
  activeToday: boolean;
  label: "Días seguidos" | "Racha actual";
  displayValue: string;
  message: string;
}

export function computeCurrentStreak(
  activityDays: Iterable<string>,
  today = new Date()
): number {
  const days = new Set(activityDays);
  let currentStreak = 0;
  let day = startOfDay(today);

  while (days.has(format(day, "yyyy-MM-dd"))) {
    currentStreak += 1;
    day = subDays(day, 1);
  }

  // La actividad de ayer conserva la racha mientras el día de hoy siga
  // pendiente, pero cualquier hueco anterior sí rompe la cadena.
  if (currentStreak === 0) {
    day = subDays(startOfDay(today), 1);
    while (days.has(format(day, "yyyy-MM-dd"))) {
      currentStreak += 1;
      day = subDays(day, 1);
    }
  }

  return currentStreak;
}

export function getStreakProgress(
  currentStreak: number,
  hasActivityToday: boolean
): StreakProgress {
  const days = Number.isFinite(currentStreak)
    ? Math.max(0, Math.floor(currentStreak))
    : 0;
  const unlocked = days >= STREAK_UNLOCK_DAYS;
  const daysRemaining = Math.max(0, STREAK_UNLOCK_DAYS - days);
  const activeToday = unlocked && hasActivityToday;

  if (!unlocked) {
    const remainingLabel = `${daysRemaining} ${
      daysRemaining === 1 ? "día" : "días"
    }`;

    return {
      days,
      daysRemaining,
      unlocked,
      activeToday,
      label: "Días seguidos",
      displayValue: `${days} de ${STREAK_UNLOCK_DAYS}`,
      message: `Sigue entrando y registrando tu día. En ${remainingLabel} desbloqueas tu racha.`,
    };
  }

  return {
    days,
    daysRemaining,
    unlocked,
    activeToday,
    label: "Racha actual",
    displayValue: String(days),
    message: activeToday
      ? "¡Racha activa! Sigue así."
      : "Entra hoy y registra tu día para mantener la racha.",
  };
}
