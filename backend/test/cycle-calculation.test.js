const test = require('node:test');
const assert = require('node:assert/strict');

const cycleMath = import('../../src/lib/cycleMath.ts');

function record(id, startDate, endDate = null) {
  return {
    id,
    profileId: 'profile-1',
    startDate,
    endDate,
    createdAt: `${startDate}T12:00:00.000Z`,
    updatedAt: `${startDate}T12:00:00.000Z`,
  };
}

test('reports the current day of an open period inclusively', async () => {
  const { calculateCycleSummary } = await cycleMath;
  const summary = calculateCycleSummary(
    [record('one', '2026-08-05')],
    '2026-08-09',
  );

  assert.equal(summary.currentDay, 5);
  assert.equal(summary.openRecord.id, 'one');
  assert.equal(summary.estimatedNextStart, null);
});

test('calculates averages and a next start across month boundaries', async () => {
  const { calculateCycleSummary } = await cycleMath;
  const summary = calculateCycleSummary(
    [
      record('three', '2026-07-26', '2026-07-30'),
      record('one', '2026-05-31', '2026-06-04'),
      record('two', '2026-06-28', '2026-07-03'),
    ],
    '2026-08-09',
  );

  assert.equal(summary.averageCycleDays, 28);
  assert.equal(summary.averagePeriodDays, 5);
  assert.equal(summary.estimatedNextStart, '2026-08-23');
  assert.equal(summary.estimateIsPast, false);
});

test('handles leap years without shifting date-only values', async () => {
  const { calculateCycleSummary } = await cycleMath;
  const summary = calculateCycleSummary(
    [
      record('one', '2024-02-01', '2024-02-05'),
      record('two', '2024-02-29', '2024-03-04'),
      record('three', '2024-03-28', '2024-04-01'),
    ],
    '2024-04-10',
  );

  assert.equal(summary.averageCycleDays, 28);
  assert.equal(summary.estimatedNextStart, '2024-04-25');
});

test('marks an outdated estimate as pending an update', async () => {
  const { calculateCycleSummary } = await cycleMath;
  const summary = calculateCycleSummary(
    [
      record('zero', '2026-05-04', '2026-05-08'),
      record('one', '2026-06-01', '2026-06-05'),
      record('two', '2026-06-29', '2026-07-03'),
    ],
    '2026-08-09',
  );

  assert.equal(summary.estimatedNextStart, '2026-07-27');
  assert.equal(summary.estimateIsPast, true);
});

test('waits for two complete intervals before estimating', async () => {
  const { calculateCycleSummary } = await cycleMath;
  const summary = calculateCycleSummary(
    [
      record('one', '2026-06-01', '2026-06-05'),
      record('two', '2026-06-29', '2026-07-03'),
    ],
    '2026-07-10',
  );

  assert.equal(summary.averageCycleDays, null);
  assert.equal(summary.estimatedNextStart, null);
});

test('ignores implausible intervals when calculating recent averages', async () => {
  const { calculateCycleSummary } = await cycleMath;
  const summary = calculateCycleSummary(
    [
      record('one', '2026-01-01', '2026-01-05'),
      record('two', '2026-01-29', '2026-02-02'),
      record('outlier', '2026-05-15', '2026-05-19'),
      record('three', '2026-06-12', '2026-06-16'),
      record('four', '2026-07-10', '2026-07-14'),
    ],
    '2026-07-20',
  );

  assert.equal(summary.averageCycleDays, 28);
  assert.equal(summary.estimatedNextStart, '2026-08-07');
});

test('returns an empty summary when there are no records', async () => {
  const { calculateCycleSummary } = await cycleMath;
  const summary = calculateCycleSummary([], '2026-08-09');

  assert.equal(summary.latestRecord, null);
  assert.equal(summary.openRecord, null);
  assert.equal(summary.averageCycleDays, null);
  assert.equal(summary.averagePeriodDays, null);
});

test('rejects invalid date-only values', async () => {
  const { calculateCycleSummary } = await cycleMath;

  assert.throws(
    () => calculateCycleSummary([], '09/08/2026'),
    /fecha del periodo no es válida/,
  );
});

test('rejects future and overlapping starts', async () => {
  const { assertCycleStartAllowed } = await cycleMath;
  const existing = [record('one', '2026-08-01', '2026-08-05')];

  assert.throws(
    () => assertCycleStartAllowed(existing, '2026-08-04', '2026-08-09'),
    /después del último registro/,
  );
  assert.throws(
    () => assertCycleStartAllowed(existing, '2026-08-10', '2026-08-09'),
    /futuro/,
  );
  assert.doesNotThrow(() =>
    assertCycleStartAllowed(existing, '2026-08-06', '2026-08-09'),
  );
});

test('requires finishing an open period before starting another', async () => {
  const { assertCycleStartAllowed } = await cycleMath;

  assert.throws(
    () =>
      assertCycleStartAllowed(
        [record('open', '2026-08-01')],
        '2026-08-09',
        '2026-08-09',
      ),
    /periodo que está en curso/,
  );
});

test('validates period end dates', async () => {
  const { assertCycleEndAllowed } = await cycleMath;
  const open = record('open', '2026-08-05');

  assert.throws(
    () => assertCycleEndAllowed(open, '2026-08-04', '2026-08-09'),
    /anterior al inicio/,
  );
  assert.throws(
    () => assertCycleEndAllowed(open, '2026-08-10', '2026-08-09'),
    /futuro/,
  );
  assert.doesNotThrow(() =>
    assertCycleEndAllowed(open, '2026-08-05', '2026-08-09'),
  );
});
