"use client";

import { useLocalCalendarDate } from "@/src/hooks/use-local-calendar-date";
import type { TilContributionDay } from "@/src/lib/til/types";

import {
  createContributionCalendar,
  createContributionSummary,
  type ContributionCalendarCell,
} from "./contribution-calendar";
import styles from "./ContributionGraph.module.css";

type ContributionGraphProps = {
  github: string;
  contributions: TilContributionDay[];
};

const WEEKDAY_LABELS = ["", "월", "", "수", "", "금", ""];
// Reserve the 53-week grid until the browser's date is available.
const PENDING_CALENDAR = Array<null>(53 * 7).fill(null);

function getContributionLabel({ date, count }: ContributionCalendarCell) {
  return count === 0
    ? `${date}: No TIL`
    : `${date}: ${count} TIL${count === 1 ? "" : "s"}`;
}

function formatSummaryDate(date: string | null) {
  return date ? date.slice(5).replace("-", ".") : "—";
}

export function ContributionGraph({
  github,
  contributions,
}: ContributionGraphProps) {
  const endDate = useLocalCalendarDate();
  const calendar = endDate
    ? createContributionCalendar(contributions, endDate)
    : PENDING_CALENDAR;
  const summary = endDate
    ? createContributionSummary(contributions, endDate)
    : null;

  return (
    <section
      className={styles.section}
      aria-label={`${github} TIL contribution history`}
      aria-busy={!endDate}
    >
      <div className={styles.history}>
        <div className={styles.viewport} tabIndex={0}>
          <div className={styles.graphBody}>
            <div className={styles.weekdayLabels} aria-hidden="true">
              {WEEKDAY_LABELS.map((label, index) => (
                <span key={`${label}:${index}`}>{label}</span>
              ))}
            </div>

            <div
              className={styles.calendar}
              role="grid"
              aria-label={`${github} TIL contributions for the last 365 days`}
            >
              {calendar.map((cell, index) => {
                if (!cell) {
                  return (
                    <span
                      className={styles.placeholder}
                      key={`empty:${index}`}
                      aria-hidden="true"
                    />
                  );
                }

                const label = getContributionLabel(cell);

                return (
                  <span
                    className={styles.cell}
                    data-date={cell.date}
                    data-count={cell.count}
                    data-level={cell.level}
                    key={cell.date}
                    role="gridcell"
                    title={label}
                    aria-label={label}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.legend} aria-label="Contribution intensity">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              className={styles.cell}
              data-level={level}
              key={level}
              aria-hidden="true"
            />
          ))}
          <span>More</span>
        </div>
      </div>

      <dl className={styles.summary} aria-label="TIL activity summary">
        <div className={styles.summaryItem}>
          <dt>이번 주</dt>
          <dd>{summary ? `${summary.weeklyCount} TIL` : "—"}</dd>
        </div>
        <div className={styles.summaryItem}>
          <dt>연속 기록</dt>
          <dd>{summary ? `${summary.streakDays}일` : "—"}</dd>
        </div>
        <div className={styles.summaryItem}>
          <dt>최근 작성</dt>
          <dd>{formatSummaryDate(summary?.latestDate ?? null)}</dd>
        </div>
      </dl>
    </section>
  );
}
