const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export function getTilDateRecency(date: string, today: string) {
  const daysAgo = Math.round(
    (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)) /
      DAY_IN_MILLISECONDS,
  );

  return daysAgo >= 0 && daysAgo < 5 ? 5 - daysAgo : 0;
}

export function formatTilDate(date: string) {
  return date.slice(2).replaceAll("-", ".");
}
