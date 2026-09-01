import Image from "next/image";
import Link from "next/link";

import type { MemberTilSummary } from "@/src/lib/til/types";

import { ContributionGraph } from "./ContributionGraph";
import styles from "./MemberTilRow.module.css";

type MemberTilRowProps = {
  summary: MemberTilSummary;
  calendarEndDate: string;
};

function buildMemberTilHref(github: string) {
  return `/til/${encodeURIComponent(github)}`;
}

function buildPostTilHref(github: string, slug: string) {
  const encodedSlug = slug
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${buildMemberTilHref(github)}/${encodedSlug}`;
}

function buildGithubHref(github: string) {
  return `https://github.com/${encodeURIComponent(github)}`;
}

function buildGithubAvatarUrl(github: string) {
  return `${buildGithubHref(github)}.png?size=160`;
}

function formatPostCount(totalPosts: number) {
  return `${totalPosts} TIL${totalPosts === 1 ? "" : "s"}`;
}

export function MemberTilRow({
  summary,
  calendarEndDate,
}: MemberTilRowProps) {
  const githubHref = buildGithubHref(summary.github);

  return (
    <article className={styles.row}>
      <section
        className={styles.profile}
        aria-labelledby={`member-${summary.github}`}
      >
        <a
          className={styles.avatarLink}
          href={githubHref}
          target="_blank"
          rel="noreferrer"
          aria-label={`${summary.name} GitHub profile`}
        >
          <Image
            className={styles.avatar}
            src={buildGithubAvatarUrl(summary.github)}
            alt={`${summary.name} GitHub profile image`}
            width={88}
            height={88}
            unoptimized
          />
        </a>

        <div className={styles.profileText}>
          <h3 className={styles.memberName} id={`member-${summary.github}`}>
            {summary.name}
          </h3>
          <a
            className={styles.githubLink}
            href={githubHref}
            target="_blank"
            rel="noreferrer"
          >
            @{summary.github}
          </a>
          <p className={styles.postCount}>{formatPostCount(summary.totalPosts)}</p>
        </div>

        <Link
          className={styles.tilLink}
          href={buildMemberTilHref(summary.github)}
        >
          TIL 보러가기
          <span aria-hidden="true">→</span>
        </Link>
      </section>

      <div className={styles.contribution}>
        <ContributionGraph
          github={summary.github}
          contributions={summary.contributions}
          endDate={calendarEndDate}
        />
      </div>

      <section className={styles.recent} aria-label="Recent TIL">
        {summary.recentPosts.length ? (
          <ol className={styles.recentList}>
            {summary.recentPosts.map((post) => (
              <li key={`${post.github}:${post.slug}`}>
                <Link
                  className={styles.postLink}
                  href={buildPostTilHref(post.github, post.slug)}
                >
                  <time className={styles.postDate} dateTime={post.date}>
                    {post.date.slice(5)}
                  </time>
                  <span className={styles.postCopy}>
                    <strong className={styles.postTitle}>{post.title}</strong>
                    {post.description ? (
                      <span className={styles.postDescription}>
                        {post.description}
                      </span>
                    ) : null}
                  </span>
                  <span className={styles.postArrow} aria-hidden="true">
                    ↗
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.emptyPosts}>No TIL posts yet.</p>
        )}
      </section>
    </article>
  );
}
