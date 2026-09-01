import { MemberTilRow } from "@/src/components/home/MemberTilRow";
import { getUtcCalendarDate } from "@/src/components/home/contribution-calendar";
import { getAllMemberTilSummaries } from "@/src/lib/til/stats";

import styles from "./page.module.css";

export default async function Home() {
  const summaries = await getAllMemberTilSummaries({ recentPostLimit: 3 });
  const calendarEndDate = getUtcCalendarDate();

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.hero}>
          <p className={styles.kicker}>Group study archive</p>
          <h1 className={styles.logo}>
            <span>He11divers</span>
            <strong>TIL</strong>
          </h1>
          <p className={styles.introduction}>
            매일의 배움을 기록하고, 함께 쌓아가는 개발 스터디 아카이브
          </p>
        </header>

        <section className={styles.dashboard} aria-labelledby="dashboard-title">
          <div className={styles.dashboardHeader}>
            <div>
              <p className={styles.sectionKicker}>Study dashboard</p>
              <h2 className={styles.dashboardTitle} id="dashboard-title">
                TIL 현황
              </h2>
            </div>
            <p className={styles.memberCount}>
              {summaries.length} member{summaries.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className={styles.memberList}>
            {summaries.map((summary) => (
              <MemberTilRow
                summary={summary}
                calendarEndDate={calendarEndDate}
                key={summary.github}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
