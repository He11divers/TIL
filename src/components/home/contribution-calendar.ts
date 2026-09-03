import type { TilContributionDay } from "@/src/lib/til/types";

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export type ContributionCalendarCell = {
  date: string;
  count: number;
  level: ContributionLevel;
};

export type ContributionCalendarSlot = ContributionCalendarCell | null;

export type ContributionSummary = {
  weeklyCount: number;
  streakDays: number;
  latestDate: string | null;
};

function parseCalendarDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

function formatCalendarDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addCalendarDays(date: string, days: number) {
  const value = parseCalendarDate(date);

  value.setTime(value.getTime() + days * DAY_IN_MILLISECONDS);

  return formatCalendarDate(value);
}

export function createContributionSummary(
  contributions: readonly TilContributionDay[],
  endDate: string,
): ContributionSummary {
  const countsByDate = new Map(
    contributions.map(({ date, count }) => [date, count]),
  );
  const daysSinceMonday = (parseCalendarDate(endDate).getUTCDay() + 6) % 7;
  const weekStart = addCalendarDays(endDate, -daysSinceMonday);
  const weeklyCount = contributions.reduce((total, contribution) => {
    if (contribution.date < weekStart || contribution.date > endDate) {
      return total;
    }

    return total + contribution.count;
  }, 0);
  const latestDate = contributions.reduce<string | null>((latest, item) => {
    if (item.date > endDate || (latest && item.date <= latest)) {
      return latest;
    }

    return item.date;
  }, null);
  const yesterday = addCalendarDays(endDate, -1);
  let streakDate = (countsByDate.get(endDate) ?? 0) > 0 ? endDate : yesterday;
  let streakDays = 0;

  while ((countsByDate.get(streakDate) ?? 0) > 0) {
    streakDays += 1;
    streakDate = addCalendarDays(streakDate, -1);
  }

  return {
    weeklyCount,
    streakDays,
    latestDate,
  };
}

export function getContributionLevel(count: number): ContributionLevel {
  if (count <= 0) {
    return 0;
  }

  if (count >= 4) {
    return 4;
  }

  return count as ContributionLevel;
}

export function createContributionCalendar(
  contributions: readonly TilContributionDay[],
  endDate: string,
  totalDays = 365,
): ContributionCalendarSlot[] {
  const countsByDate = new Map(
    contributions.map(({ date, count }) => [date, count]),
  );
  const startDate = addCalendarDays(endDate, -(totalDays - 1));
  const leadingEmptyDays = parseCalendarDate(startDate).getUTCDay();
  const calendar: ContributionCalendarSlot[] = Array.from(
    { length: leadingEmptyDays },
    () => null,
  );

  for (let dayOffset = 0; dayOffset < totalDays; dayOffset += 1) {
    const date = addCalendarDays(startDate, dayOffset);
    const count = countsByDate.get(date) ?? 0;

    calendar.push({
      date,
      count,
      level: getContributionLevel(count),
    });
  }

  return calendar;
}
