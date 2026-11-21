"use client";

import { useLocalCalendarDate } from "@/src/hooks/use-local-calendar-date";
import { formatTilDate, getTilDateRecency } from "@/src/lib/til/date";
import styles from "./TilDateBadge.module.css";

export function TilDateBadge({ date, time }: { date: string; time?: string }) {
  const today = useLocalCalendarDate();
  return (
    <time className={styles.badge} dateTime={time ? `${date}T${time}` : date}
      data-recency={today ? getTilDateRecency(date, today) : 0}
      title={`${date}${time ? ` ${time}` : ""}`}>
      {formatTilDate(date)}{time ? ` ${time}` : ""}
    </time>
  );
}
