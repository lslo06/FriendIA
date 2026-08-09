import {
  addDays,
  differenceInCalendarDays,
  format,
  isValid,
  parseISO,
} from "date-fns";
import type { CycleRecord } from "./types";

export interface CycleSummary {
  latestRecord: CycleRecord | null;
  openRecord: CycleRecord | null;
  currentDay: number | null;
  averageCycleDays: number | null;
  averagePeriodDays: number | null;
  estimatedNextStart: string | null;
  estimateIsPast: boolean;
}

function parseDateOnly(value: string): Date {
  const parsed = parseISO(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !isValid(parsed)) {
    throw new Error("La fecha del periodo no es válida");
  }
  return parsed;
}

export function assertCycleStartAllowed(
  records: CycleRecord[],
  startDate: string,
  today = format(new Date(), "yyyy-MM-dd")
) {
  parseDateOnly(startDate);
  parseDateOnly(today);
  if (startDate > today) {
    throw new Error("La fecha no puede estar en el futuro");
  }

  const latestRecord = [...records].sort((a, b) =>
    b.startDate.localeCompare(a.startDate)
  )[0];
  if (!latestRecord) return;
  if (!latestRecord.endDate) {
    throw new Error("Primero registra el fin del periodo que está en curso");
  }
  parseDateOnly(latestRecord.endDate);
  if (startDate <= latestRecord.endDate) {
    throw new Error(
      "El nuevo periodo debe comenzar después del último registro"
    );
  }
}

export function assertCycleEndAllowed(
  record: CycleRecord,
  endDate: string,
  today = format(new Date(), "yyyy-MM-dd")
) {
  parseDateOnly(record.startDate);
  parseDateOnly(endDate);
  parseDateOnly(today);
  if (endDate > today) {
    throw new Error("La fecha no puede estar en el futuro");
  }
  if (endDate < record.startDate) {
    throw new Error("La fecha de fin no puede ser anterior al inicio");
  }
}

export function calculateCycleSummary(
  records: CycleRecord[],
  today = format(new Date(), "yyyy-MM-dd")
): CycleSummary {
  parseDateOnly(today);

  const sorted = [...records].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );
  const latestRecord = sorted.length > 0 ? sorted[sorted.length - 1] : null;
  const openRecord = latestRecord?.endDate === null ? latestRecord : null;

  const cycleLengths: number[] = [];
  for (let index = 1; index < sorted.length; index += 1) {
    const days = differenceInCalendarDays(
      parseDateOnly(sorted[index].startDate),
      parseDateOnly(sorted[index - 1].startDate)
    );
    if (days >= 15 && days <= 90) cycleLengths.push(days);
  }

  const periodLengths = sorted.flatMap((record) => {
    if (!record.endDate) return [];
    const days =
      differenceInCalendarDays(
        parseDateOnly(record.endDate),
        parseDateOnly(record.startDate)
      ) + 1;
    return days > 0 && days <= 30 ? [days] : [];
  });

  const recentCycleLengths = cycleLengths.slice(-6);
  const recentPeriodLengths = periodLengths.slice(-6);

  const averageCycleDays = recentCycleLengths.length >= 2
    ? Math.round(
        recentCycleLengths.reduce((total, days) => total + days, 0) /
          recentCycleLengths.length
      )
    : null;
  const averagePeriodDays = recentPeriodLengths.length
    ? Math.round(
        recentPeriodLengths.reduce((total, days) => total + days, 0) /
          recentPeriodLengths.length
      )
    : null;

  const estimatedNextStart =
    latestRecord && averageCycleDays
      ? format(
          addDays(parseDateOnly(latestRecord.startDate), averageCycleDays),
          "yyyy-MM-dd"
        )
      : null;

  const currentDay = openRecord
    ? differenceInCalendarDays(
        parseDateOnly(today),
        parseDateOnly(openRecord.startDate)
      ) + 1
    : null;

  return {
    latestRecord,
    openRecord,
    currentDay: currentDay && currentDay > 0 ? currentDay : null,
    averageCycleDays,
    averagePeriodDays,
    estimatedNextStart,
    estimateIsPast: Boolean(estimatedNextStart && estimatedNextStart < today),
  };
}
