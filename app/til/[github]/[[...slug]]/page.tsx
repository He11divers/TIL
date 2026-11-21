import { notFound } from "next/navigation";
import Link from "next/link";
import { FolderPosts } from "@/src/components/til/FolderPosts";
import { findTilDirectory } from "@/src/lib/til/folders";
import { buildFolderHref } from "@/src/lib/til/navigation";

import { MarkdownViewer } from "@/src/components/til/MarkdownViewer";
import { TilSidebar } from "@/src/components/til/TilSidebar";
import { TableOfContents } from "@/src/components/til/TableOfContents";
import { getMarkdownHeadings } from "@/src/lib/til/markdown-headings";
import { getPost } from "@/src/lib/til/post";
import { flattenTilFiles, getMemberTree } from "@/src/lib/til/tree";
import { getRecentTilFiles } from "@/src/lib/til/recent";
import { study } from "@/study.config";

import styles from "./page.module.css";

type TilPageProps = {
  searchParams: Promise<{ folder?: string | string[] }>;
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

export default async function TilPage({ params, searchParams }: TilPageProps) {
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

  const requestedFolder = (await searchParams).folder;
  if (!post && Array.isArray(requestedFolder)) notFound();
  const activeFolder = post
    ? post.path.split("/").slice(0, -1).join("/")
    : typeof requestedFolder === "string" ? requestedFolder : "";
  const directory = activeFolder ? findTilDirectory(memberTree.children, activeFolder) : null;
  if (activeFolder && !directory) notFound();

  const headings = post ? getMarkdownHeadings(post.content) : [];

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <TilSidebar
          key={currentGithub}
          members={study.members}
          currentGithub={currentGithub}
          tree={memberTree.children}
          recentFiles={getRecentTilFiles(flattenTilFiles(memberTree.children))}
          activeSlug={activeSlug}
          activeFolder={activeFolder}
        />

        <section className={styles.content}>
          {post ? (
            <div className={`${styles.readingLayout} ${headings.length ? styles.withToc : ""}`}>
              <article className={styles.article} id="til-post-content">
                <header className={styles.postHeader}>
                  <Link className={styles.backToFolder} href={buildFolderHref(currentGithub, activeFolder)}>
                    ← {activeFolder.split("/").at(-1) || "전체 글"} 목록
                  </Link>
                  <p className={styles.postLabel}>TIL Note</p>
                  <h1 className={styles.postTitle}>{post.title}</h1>
                  {post.description ? (
                    <p className={styles.postDescription}>{post.description}</p>
                  ) : null}
                  <time
                    className={styles.postDate}
                    dateTime={post.time ? `${post.date}T${post.time}` : post.date}
                  >
                    {post.date}{post.time ? ` ${post.time}` : ""}
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
              <TableOfContents
                key={`${post.github}:${post.slug}`}
                headings={headings}
                contentId="til-post-content"
              />
            </div>
          ) : (
            <FolderPosts key={`${currentGithub}:${activeFolder}`} github={currentGithub} name={memberTree.name} folder={activeFolder}
              nodes={directory?.children ?? memberTree.children} />
          )}
        </section>
      </div>
    </main>
  );
}
