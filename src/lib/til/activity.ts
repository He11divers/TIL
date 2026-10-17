import type { TilContributionDay } from "./types";

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const DORMANT_AFTER_DAYS = 21;

export function isDormantMember(
  contributions: readonly TilContributionDay[],
  today: string,
) {
  const latestDate = contributions.reduce<string | null>((latest, day) => {
    if (day.count <= 0 || day.date > today || (latest && day.date <= latest)) {
      return latest;
    }

    return day.date;
  }, null);

  if (!latestDate) {
    return true;
  }

  const daysSinceLastPost =
    (Date.parse(`${today}T00:00:00Z`) -
      Date.parse(`${latestDate}T00:00:00Z`)) /
    DAY_IN_MILLISECONDS;

  return daysSinceLastPost >= DORMANT_AFTER_DAYS;
}
