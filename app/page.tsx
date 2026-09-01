import Image from "next/image";

import { MemberTilRow } from "@/src/components/home/MemberTilRow";
import { getUtcCalendarDate } from "@/src/components/home/contribution-calendar";
import { getAllMemberTilSummaries } from "@/src/lib/til/stats";

import siteIcon from "./icon.png";
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
            <Image
              className={styles.logoImage}
              src={siteIcon}
              alt=""
              priority
            />
            <span className={styles.logoText}>
              <span>He11divers</span>
              <strong>TIL</strong>
            </span>
          </h1>
          <p className={styles.introduction}>
            당신은 오늘 개발한 내용을 기록하고 싶어진다.... 기록하고 싶어진다..
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
