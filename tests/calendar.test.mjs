import assert from 'node:assert/strict';
import test from 'node:test';
import { createMonthDays, moveCalendarMonth, countPostsByDate, filterPostsByDate } from '../src/lib/til/calendar.ts';
import { getContributionLevel } from '../src/components/home/contribution-calendar.ts';

const posts = Object.freeze([
  Object.freeze({title:'최근',date:'2026-11-20'}),
  Object.freeze({title:'가',date:'2026-09-01'}),
  Object.freeze({title:'나',date:'2026-09-01'}),
  Object.freeze({title:'지난해',date:'2025-09-01'}),
]);

test('unselected calendar shows all posts; month and day filters preserve post order and source data', () => {
  assert.deepEqual(filterPostsByDate(posts,null),posts);
  assert.deepEqual(filterPostsByDate(posts,{type:'month',value:'2026-09'}).map(p=>p.title),['가','나']);
  assert.deepEqual(filterPostsByDate(posts,{type:'day',value:'2026-09-01'}).map(p=>p.title),['가','나']);
  assert.deepEqual(filterPostsByDate(posts,{type:'day',value:'2026-09-02'}),[]);
  assert.deepEqual(filterPostsByDate(posts,{type:'month',value:'2026-10'}),[]);
  assert.equal(posts.length,4);
});

test('contribution counts are per category/date and do not change when filtering results', () => {
  const counts = countPostsByDate(posts);
  assert.equal(counts.get('2026-09-01'),2);
  filterPostsByDate(posts,{type:'month',value:'2026-11'});
  assert.equal(counts.get('2026-09-01'),2);
  assert.equal(countPostsByDate(posts.slice(1,2)).get('2026-09-01'),1);
  assert.equal(countPostsByDate([]).size,0);
  assert.deepEqual([0,1,2,3,4,8].map(getContributionLevel),[0,1,2,3,4,4]);
});

test('one-month grid aligns Sunday through Saturday and contains each day exactly once', () => {
  const days = createMonthDays('2026-01');
  assert.equal(days.length,42);
  assert.deepEqual(days.slice(0,4),[null,null,null,null]);
  assert.equal(days[4],'2026-01-01');
  assert.equal(days.filter(Boolean).length,31);
  assert.equal(days[34],'2026-01-31');
  assert.equal(days[35],null);
  assert.equal(new Set(days.filter(Boolean)).size,31);
});

test('calendar supports leap years, century exceptions, and six-week months', () => {
  assert.equal(createMonthDays('2024-02').filter(Boolean).length,29);
  assert.equal(createMonthDays('1900-02').filter(Boolean).length,28);
  assert.equal(createMonthDays('2000-02').filter(Boolean).length,29);
  assert.equal(createMonthDays('2026-05')[35],'2026-05-31');
  assert.equal(createMonthDays('0001-01').filter(Boolean).length,31);
  assert.equal(createMonthDays('9999-12').filter(Boolean).length,31);
});

test('month navigation crosses year boundaries and respects supported calendar limits', () => {
  assert.equal(moveCalendarMonth('2026-12',1),'2027-01');
  assert.equal(moveCalendarMonth('2026-01',-1),'2025-12');
  assert.equal(moveCalendarMonth('0001-01',-1),null);
  assert.equal(moveCalendarMonth('9999-12',1),null);
});
