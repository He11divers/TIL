import Link from "next/link";

import { getFolderFiles } from "@/src/lib/til/folders";
import { buildFolderHref, buildPostHref } from "@/src/lib/til/navigation";
import type { TilTreeNode } from "@/src/lib/til/types";
import styles from "./FolderPosts.module.css";
import { TilDateBadge } from "./TilDateBadge";

export function FolderPosts({ github, name, folder, nodes }: {
  github: string; name: string; folder: string; nodes: TilTreeNode[];
}) {
  const files = getFolderFiles(nodes);
  const segments = folder ? folder.split("/") : [];
  const directories = nodes.filter(node => node.type === "directory");

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb} aria-label="카테고리 경로">
        <Link href={buildFolderHref(github)}>전체 글</Link>
        {segments.map((segment, index) => (
          <span key={index}>
            <span aria-hidden="true"> / </span>
            <Link href={buildFolderHref(github, segments.slice(0, index + 1).join("/"))}
              aria-current={index === segments.length - 1 ? "page" : undefined}>{segment}</Link>
          </span>
        ))}
      </nav>
      <header className={styles.header}>
        <p className={styles.author}>{name}의 TIL</p>
        <h1>{segments.at(-1) ?? "전체 글"}</h1>
        <p>{files.length}개의 글{folder ? " · 하위 폴더 포함" : ""} · 작성일 오름차순</p>
      </header>
      {directories.length ? (
        <nav className={styles.folders} aria-label="하위 폴더">
          {directories.map(directory => (
            <Link key={directory.path} href={buildFolderHref(github, directory.path)}>
              {directory.name}<span>{getFolderFiles(directory.children).length}</span>
            </Link>
          ))}
        </nav>
      ) : null}
      {files.length ? (
        <ol className={styles.posts} aria-label="폴더 글 목록">
          {files.map(file => (
            <li key={file.path}>
              <Link className={styles.post} href={buildPostHref(github, file.slug)}>
                <TilDateBadge date={file.date} time={file.time} />
                <h2>{file.title}</h2>
                {file.description ? <p>{file.description}</p> : null}
                <span className={styles.path}>{file.path.split("/").slice(0, -1).join(" / ") || "루트"}</span>
                <span className={styles.read}>글 읽기 <span aria-hidden="true">→</span></span>
              </Link>
            </li>
          ))}
        </ol>
      ) : <p className={styles.empty}>이 폴더에는 아직 작성한 글이 없습니다.</p>}
    </div>
  );
}
