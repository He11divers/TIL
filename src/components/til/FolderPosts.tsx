"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { countFolderPosts, getFolderFiles } from "@/src/lib/til/folders";
import { buildFolderHref, buildPostHref } from "@/src/lib/til/navigation";
import type { TilTreeNode } from "@/src/lib/til/types";
import styles from "./FolderPosts.module.css";
import { TilDateBadge } from "./TilDateBadge";
import { PostPreviewImage } from "./PostPreviewImage";
import { PostCalendar } from "./PostCalendar";
import { countPostsByDate, filterPostsByDate, type TilDateFilter } from "@/src/lib/til/calendar";

export function FolderPosts({ github, name, folder, nodes }: {
  github: string; name: string; folder: string; nodes: TilTreeNode[];
}) {
  const files = useMemo(() => getFolderFiles(nodes), [nodes]);
  const counts = useMemo(() => countPostsByDate(files), [files]);
  const [filter, setFilter] = useState<TilDateFilter>(null);
  const visibleFiles = filterPostsByDate(files, filter);
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
        <div className={styles.heading}>
          <p className={styles.author}>{name}의 TIL</p>
          <h1>{segments.at(-1) ?? "전체 글"}</h1>
        </div>
        <PostCalendar counts={counts} fallbackMonth={files[0]?.date.slice(0, 7)}
          filter={filter} onFilterChange={setFilter} />
      </header>
      {directories.length ? (
        <nav className={styles.folders} aria-label="하위 폴더">
          {directories.map(directory => (
            <Link key={directory.path} href={buildFolderHref(github, directory.path)}>
              {directory.name} <span>({countFolderPosts(directory.children)})</span>
            </Link>
          ))}
        </nav>
      ) : null}
      <div id="til-folder-results">
        <div className={styles.filterStatus}>
          <p role="status">{filter ? `${filter.value} · ${visibleFiles.length}개의 글` : ""}</p>
          {filter ? <button type="button" onClick={() => setFilter(null)}>전체 글 보기</button> : null}
        </div>
        {visibleFiles.length ? (
          <ol className={styles.posts} aria-label="폴더 글 목록">
            {visibleFiles.map(file => (
              <li key={file.path}>
                <Link className={styles.post} href={buildPostHref(github, file.slug)}>
                  <div className={styles.postText}>
                    <TilDateBadge date={file.date} time={file.time} />
                    <h2>{file.title}</h2>
                    {file.description ? <p>{file.description}</p> : null}
                    <span className={styles.path}>{file.path.split("/").slice(0, -1).join(" / ") || "루트"}</span>
                  </div>
                  {file.previewImage ? <PostPreviewImage key={file.previewImage.src}
                    src={file.previewImage.src} alt={file.previewImage.alt} /> : null}
                </Link>
              </li>
            ))}
          </ol>
        ) : <p className={styles.empty}>{filter ? "선택한 날짜에 작성한 글이 없습니다." : "이 폴더에는 아직 작성한 글이 없습니다."}</p>}
      </div>
    </div>
  );
}
