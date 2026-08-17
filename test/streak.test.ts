import assert from "node:assert/strict";
import test from "node:test";
import {
  computeCurrentStreak,
  getStreakProgress,
  STREAK_UNLOCK_DAYS,
} from "../src/lib/streak.ts";

const TODAY = new Date(2026, 7, 17, 12);

test("counts only strictly consecutive activity days", () => {
  assert.equal(
    computeCurrentStreak(["2026-08-15", "2026-08-16", "2026-08-17"], TODAY),
    3
  );
  assert.equal(
    computeCurrentStreak(["2026-08-14", "2026-08-16", "2026-08-17"], TODAY),
    2
  );
});

test("keeps yesterday's consecutive streak while today is pending", () => {
  assert.equal(
    computeCurrentStreak(["2026-08-14", "2026-08-15", "2026-08-16"], TODAY),
    3
  );
  assert.equal(
    computeCurrentStreak(["2026-08-14", "2026-08-15"], TODAY),
    0
  );
});

test("does not unlock or light the streak before day three", () => {
  for (const days of [0, 1, 2]) {
    const progress = getStreakProgress(days, true);
    assert.equal(progress.unlocked, false);
    assert.equal(progress.activeToday, false);
    assert.equal(progress.daysRemaining, STREAK_UNLOCK_DAYS - days);
    assert.equal(progress.displayValue, `${days} de ${STREAK_UNLOCK_DAYS}`);
  }
});

test("unlocks on day three and lights only after today's activity", () => {
  const pending = getStreakProgress(3, false);
  assert.equal(pending.unlocked, true);
  assert.equal(pending.activeToday, false);
  assert.match(pending.message, /Entra hoy/);

  const active = getStreakProgress(3, true);
  assert.equal(active.unlocked, true);
  assert.equal(active.activeToday, true);
  assert.match(active.message, /Racha activa/);
});
