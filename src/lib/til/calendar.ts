export type TilDateFilter = { type: "month" | "day"; value: string } | null;

export function countPostsByDate(files: readonly { date: string }[]) {
  const counts = new Map<string, number>();
  for (const file of files) counts.set(file.date, (counts.get(file.date) ?? 0) + 1);
  return counts;
}

export function filterPostsByDate<T extends { date: string }>(files: readonly T[], filter: TilDateFilter): T[] {
  if (!filter) return [...files];
  return files.filter(file => filter.type === "day"
    ? file.date === filter.value
    : file.date.startsWith(`${filter.value}-`));
}

export function moveCalendarMonth(month: string, offset: number): string | null {
  const [year, number] = month.split("-").map(Number);
  const index = year * 12 + number - 1 + offset;
  const nextYear = Math.floor(index / 12);
  if (nextYear < 1 || nextYear > 9999) return null;
  return `${String(nextYear).padStart(4, "0")}-${String(index % 12 + 1).padStart(2, "0")}`;
}

export function createMonthDays(month: string): (string | null)[] {
  const start = new Date(`${month}-01T00:00:00Z`);
  const nextMonth = new Date(start);
  nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1, 0);
  const length = nextMonth.getUTCDate();
  const weekday = start.getUTCDay();
  return Array.from({ length: 42 }, (_, index) => {
    const day = index - weekday + 1;
    return day < 1 || day > length ? null : `${month}-${String(day).padStart(2, "0")}`;
  });
}
