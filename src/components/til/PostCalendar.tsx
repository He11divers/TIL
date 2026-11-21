"use client";

import { useState } from "react";
import { useLocalCalendarDate } from "@/src/hooks/use-local-calendar-date";
import { createMonthDays, moveCalendarMonth, type TilDateFilter } from "@/src/lib/til/calendar";
import { getContributionLevel } from "@/src/components/home/contribution-calendar";
import styles from "./PostCalendar.module.css";

type PostCalendarProps = {
  counts: ReadonlyMap<string, number>;
  fallbackMonth?: string;
  filter: TilDateFilter;
  onFilterChange: (filter: TilDateFilter) => void;
};

export function PostCalendar({ counts, fallbackMonth, filter, onFilterChange }: PostCalendarProps) {
  const today = useLocalCalendarDate();
  const [browsedMonth, setBrowsedMonth] = useState<string | null>(null);
  const month = browsedMonth ?? today?.slice(0, 7) ?? fallbackMonth;
  if (!month) return <div className={styles.calendar} aria-busy="true">달력을 불러오는 중입니다.</div>;

  const [year, monthNumber] = month.split("-").map(Number);
  const previous = moveCalendarMonth(month, -1);
  const next = moveCalendarMonth(month, 1);
  const isMonthSelected = filter?.type === "month" && filter.value === month;

  return (
    <section className={styles.calendar} aria-label="카테고리 작성 달력">
      <div className={styles.navigation}>
        <button type="button" aria-label="이전 월" disabled={!previous}
          onClick={() => previous && setBrowsedMonth(previous)}>‹</button>
        <button type="button" className={styles.month} aria-pressed={isMonthSelected}
          aria-label={`${year}년 ${monthNumber}월 글 보기`} aria-controls="til-folder-results"
          onClick={() => onFilterChange(isMonthSelected ? null : { type: "month", value: month })}>
          <span className={styles.year}>{year}년</span> {monthNumber}월
        </button>
        <button type="button" aria-label="다음 월" disabled={!next}
          onClick={() => next && setBrowsedMonth(next)}>›</button>
      </div>
      <div className={styles.days}>
        {["일", "월", "화", "수", "목", "금", "토"].map(day => <span className={styles.weekday} key={day}>{day}</span>)}
        {createMonthDays(month).map((date, index) => {
          if (!date) return <span key={`blank-${index}`} aria-hidden="true" />;
          const count = counts.get(date) ?? 0;
          const selected = filter?.type === "day" && filter.value === date;
          return (
            <button key={date} type="button" className={styles.day}
              data-level={getContributionLevel(count)} data-count={count}
              aria-label={`${date}: ${count}개의 글`} title={`${date}: ${count}개의 글`}
              aria-pressed={selected} aria-current={date === today ? "date" : undefined}
              aria-controls="til-folder-results"
              onClick={() => onFilterChange(selected ? null : { type: "day", value: date })}>
              {Number(date.slice(-2))}
            </button>
          );
        })}
      </div>
      <div className={styles.legend} aria-label="작성량: 색이 진할수록 많은 글">
        <span>적음</span>
        {[0, 1, 2, 3, 4].map(level => <span className={styles.swatch} data-level={level} key={level} />)}
        <span>많음</span>
      </div>
    </section>
  );
}
