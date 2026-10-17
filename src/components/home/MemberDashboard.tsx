"use client";

import { useLocalCalendarDate } from "@/src/hooks/use-local-calendar-date";
import { isDormantMember } from "@/src/lib/til/activity";
import type { MemberTilSummary } from "@/src/lib/til/types";

import { MemberTilRow } from "./MemberTilRow";
import styles from "./MemberDashboard.module.css";

type MemberDashboardProps = {
  summaries: MemberTilSummary[];
};

export function MemberDashboard({ summaries }: MemberDashboardProps) {
  const today = useLocalCalendarDate();

  if (!today) {
    return (
      <p className={styles.notice} role="status">
        활동 현황을 불러오는 중입니다.
      </p>
    );
  }

  const activeMembers: MemberTilSummary[] = [];
  const dormantMembers: MemberTilSummary[] = [];

  for (const summary of summaries) {
    const members = isDormantMember(summary.contributions, today)
      ? dormantMembers
      : activeMembers;
    members.push(summary);
  }

  return (
    <>
      <div className={styles.memberList} role="group" aria-label="활동 멤버">
        {activeMembers.length ? (
          activeMembers.map((summary) => (
            <MemberTilRow summary={summary} key={summary.github} />
          ))
        ) : (
          <p className={styles.notice}>최근 3주 이내에 작성한 TIL이 없습니다.</p>
        )}
      </div>

      {dormantMembers.length ? (
        <details className={styles.dormantMembers}>
          <summary className={styles.dormantToggle}>
            <span className={styles.dormantTitle}>
              휴면 멤버
              <span className={styles.dormantCount}>{dormantMembers.length}명</span>
            </span>
            <span className={styles.toggleAction}>
              <span className={styles.collapsedLabel}>열기</span>
              <span className={styles.expandedLabel}>접기</span>
              <svg className={styles.chevron} viewBox="0 0 16 16" aria-hidden="true">
                <path d="m4 6 4 4 4-4" />
              </svg>
            </span>
          </summary>
          <p className={styles.dormantDescription}>
            3주 이상 새 TIL이 없거나 아직 작성한 글이 없는 멤버입니다.
          </p>
          <div className={styles.memberList}>
            {dormantMembers.map((summary) => (
              <MemberTilRow summary={summary} key={summary.github} />
            ))}
          </div>
        </details>
      ) : null}
    </>
  );
}
