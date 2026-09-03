import { notFound } from "next/navigation";

import { MarkdownViewer } from "@/src/components/til/MarkdownViewer";
import { TilSidebar } from "@/src/components/til/TilSidebar";
import { getPost } from "@/src/lib/til/post";
import { getMemberTree } from "@/src/lib/til/tree";
import { study } from "@/study.config";

import styles from "./page.module.css";

type TilPageProps = {
  params: Promise<{
    github: string;
    slug?: string[];
  }>;
};

function decodeRouteSegment(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export default async function TilPage({ params }: TilPageProps) {
  const { github, slug } = await params;
  const currentGithub = decodeRouteSegment(github);
  const memberTree = await getMemberTree(currentGithub);

  if (!memberTree) {
    notFound();
  }

  const activeSlug = slug?.length
    ? slug.map(decodeRouteSegment).join("/")
    : undefined;
  const post = activeSlug ? await getPost(currentGithub, activeSlug) : null;

  if (activeSlug && !post) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <TilSidebar
          key={currentGithub}
          members={study.members}
          currentGithub={currentGithub}
          tree={memberTree.children}
          activeSlug={activeSlug}
        />

        <section className={styles.content}>
          {post ? (
            <article className={styles.article}>
              <header className={styles.postHeader}>
                <p className={styles.postLabel}>TIL Note</p>
                <h1 className={styles.postTitle}>{post.title}</h1>
                {post.description ? (
                  <p className={styles.postDescription}>{post.description}</p>
                ) : null}
                <time
                  className={styles.postDate}
                  dateTime={post.date}
                >
                  {post.date}
                </time>
              </header>

              <div className={styles.markdownBody}>
                <MarkdownViewer
                  content={post.content}
                  github={post.github}
                  postPath={post.path}
                />
              </div>
            </article>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyContent}>
                <p className={styles.emptyLabel}>{memberTree.name}</p>
                <h1 className={styles.emptyTitle}>TIL</h1>
                <p className={styles.emptyDescription}>
                  파일 목록에서 읽을 내용을 선택하세요.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
