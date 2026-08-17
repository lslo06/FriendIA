import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { emotionIcons } from "@/lib/emotionIcons";

interface StreakIconProps {
  active: boolean;
  unlocked?: boolean;
  className?: string;
}

export function StreakIcon({
  active,
  unlocked = active,
  className = "h-9 w-9",
}: StreakIconProps) {
  const reduceMotion = useReducedMotion();

  return (
    <span
      className={`relative inline-flex shrink-0 ${className}`}
      role="img"
      aria-label={
        active
          ? "Racha encendida hoy"
          : unlocked
            ? "Racha desbloqueada; actividad de hoy pendiente"
            : "Racha aún no desbloqueada"
      }
    >
      <AnimatePresence initial={false} mode="sync">
        <motion.img
          key={active ? "active" : "inactive"}
          src={active ? emotionIcons.streak : emotionIcons.streakInactive}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-contain"
          style={{ imageRendering: "pixelated" }}
          initial={
            reduceMotion
              ? { opacity: 0 }
              : active
                ? {
                    opacity: 0,
                    scale: 0.55,
                    rotate: -12,
                    filter: "grayscale(1) brightness(0.85)",
                  }
                : { opacity: 0, scale: 0.9 }
          }
          animate={{
            opacity: 1,
            scale: 1,
            rotate: 0,
            filter: "grayscale(0) brightness(1)",
          }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: active ? 1.25 : 0.85 }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : active
                ? {
                    type: "spring",
                    stiffness: 420,
                    damping: 18,
                    mass: 0.7,
                  }
                : { duration: 0.18, ease: "easeOut" }
          }
        />
      </AnimatePresence>
    </span>
  );
}
