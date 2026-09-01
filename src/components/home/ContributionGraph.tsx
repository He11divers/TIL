import type { TilContributionDay } from "@/src/lib/til/types";

import {
  createContributionCalendar,
  type ContributionCalendarCell,
} from "./contribution-calendar";
import styles from "./ContributionGraph.module.css";

type ContributionGraphProps = {
  github: string;
  contributions: TilContributionDay[];
  endDate: string;
};

const WEEKDAY_LABELS = ["", "월", "", "수", "", "금", ""];

function getContributionLabel({ date, count }: ContributionCalendarCell) {
  return count === 0
    ? `${date}: No TIL`
    : `${date}: ${count} TIL${count === 1 ? "" : "s"}`;
}

export function ContributionGraph({
  github,
  contributions,
  endDate,
}: ContributionGraphProps) {
  const calendar = createContributionCalendar(contributions, endDate);
  const headingId = `contribution-${github}`;

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Activity</p>
          <h4 className={styles.title} id={headingId}>
            TIL Contribution History
          </h4>
        </div>
        <span className={styles.range}>최근 365일</span>
      </header>

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
    </section>
  );
}
