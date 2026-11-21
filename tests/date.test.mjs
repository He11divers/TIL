import assert from 'node:assert/strict';
import test from 'node:test';
import {getTilDateRecency} from '../src/lib/til/date.ts';

test('date badge retains all five recent-day levels and excludes future and older dates', () => {
  const dates = ['2026-11-21','2026-11-20','2026-11-19','2026-11-18','2026-11-17','2026-11-16','2026-11-22'];
  assert.deepEqual(dates.map(date => getTilDateRecency(date,'2026-11-21')), [5,4,3,2,1,0,0]);
});

test('date badges handle month, year and leap-day boundaries', () => {
  assert.equal(getTilDateRecency('2025-12-31','2026-01-01'),4);
  assert.equal(getTilDateRecency('2024-02-29','2024-03-01'),4);
});
