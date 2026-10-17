"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
} from "react";

import type { TilFileNode, TilTreeNode } from "@/src/lib/til/types";
import siteIcon from "@/app/icon.png";
import { useLocalCalendarDate } from "@/src/hooks/use-local-calendar-date";
import { buildGithubAvatarUrl } from "@/src/lib/github";
import { formatTilDate, getTilDateRecency } from "@/src/lib/til/date";

import styles from "./TilSidebar.module.css";

type MemberOption = {
  name: string;
  github: string;
};

type TilSidebarProps = {
  members: MemberOption[];
  currentGithub: string;
  tree: TilTreeNode[];
  recentFiles: TilFileNode[];
  activeSlug?: string;
};

type TilTreeProps = {
  nodes: TilTreeNode[];
  currentGithub: string;
  activeSlug?: string;
  today: string | null;
  expandedPaths: Set<string>;
  onToggleDirectory: (path: string) => void;
  onSelectFile: () => void;
  depth?: number;
};

function findActiveFile(
  nodes: TilTreeNode[],
  activeSlug: string,
  ancestors: string[] = [],
): { title: string; ancestors: string[] } | null {
  for (const node of nodes) {
    if (node.type === "file") {
      if (node.slug === activeSlug) {
        return { title: node.title, ancestors };
      }

      continue;
    }

    const result = findActiveFile(node.children, activeSlug, [
      ...ancestors,
      node.path,
    ]);

    if (result) {
      return result;
    }
  }

  return null;
}

function mergeExpandedPaths(
  currentPaths: Set<string>,
  requiredPaths: string[],
) {
  if (requiredPaths.every((path) => currentPaths.has(path))) {
    return currentPaths;
  }

  const nextPaths = new Set(currentPaths);

  for (const path of requiredPaths) {
    nextPaths.add(path);
  }

  return nextPaths;
}

function buildMemberHref(github: string) {
  return `/til/${encodeURIComponent(github)}`;
}

function buildPostHref(github: string, slug: string) {
  const encodedSlug = slug
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${buildMemberHref(github)}/${encodedSlug}`;
}

function getDepthStyle(depth: number): CSSProperties {
  return {
    "--til-tree-indent": `${0.625 + depth * 0.875}rem`,
  } as CSSProperties;
}

function TilTree({
  nodes,
  currentGithub,
  activeSlug,
  today,
  expandedPaths,
  onToggleDirectory,
  onSelectFile,
  depth = 0,
}: TilTreeProps) {
  return (
    <ul className={styles.treeList}>
      {nodes.map((node) => {
        if (node.type === "directory") {
          const isExpanded = expandedPaths.has(node.path);

          return (
            <li key={`directory:${node.path}`}>
              <button
                className={styles.directoryButton}
                style={getDepthStyle(depth)}
                type="button"
                title={node.name}
                aria-expanded={isExpanded}
                onClick={() => onToggleDirectory(node.path)}
              >
                <span className={styles.chevron} aria-hidden="true">
                  {isExpanded ? "▾" : "▸"}
                </span>
                <span className={styles.nodeName}>{node.name}</span>
              </button>

              {isExpanded ? (
                <TilTree
                  nodes={node.children}
                  currentGithub={currentGithub}
                  activeSlug={activeSlug}
                  today={today}
                  expandedPaths={expandedPaths}
                  onToggleDirectory={onToggleDirectory}
                  onSelectFile={onSelectFile}
                  depth={depth + 1}
                />
              ) : null}
            </li>
          );
        }

        const isActive = node.slug === activeSlug;

        return (
          <li key={`file:${node.path}`}>
            <Link
              className={`${styles.fileLink} ${isActive ? styles.activeFile : ""}`}
              style={getDepthStyle(depth)}
              href={buildPostHref(currentGithub, node.slug)}
              title={node.title}
              aria-current={isActive ? "page" : undefined}
              onNavigate={onSelectFile}
            >
              <span className={styles.fileMarker} aria-hidden="true">
                {isActive ? "●" : ""}
              </span>
              <time
                className={styles.fileDate}
                dateTime={node.date}
                data-recency={today ? getTilDateRecency(node.date, today) : 0}
                title={node.date}
              >
                {formatTilDate(node.date)}
              </time>
              <span className={styles.nodeName}>{node.title}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function TilSidebar({
  members,
  currentGithub,
  tree,
  recentFiles,
  activeSlug,
}: TilSidebarProps) {
  const today = useLocalCalendarDate();
  const router = useRouter();
  const currentMember = members.find(
    (member) => member.github === currentGithub,
  );
  const activeFile = useMemo(
    () => (activeSlug ? findActiveFile(tree, activeSlug) : null),
    [activeSlug, tree],
  );
  const activeAncestorPaths = activeFile?.ancestors;
  const [expandedPaths, setExpandedPaths] = useState(
    () => new Set(activeAncestorPaths),
  );
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const explorerDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    explorerDialogRef.current?.close();
  }, [activeSlug]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 56rem)");

    function handleViewportChange(event: MediaQueryListEvent) {
      if (event.matches) {
        explorerDialogRef.current?.close();
      }
    }

    desktopQuery.addEventListener("change", handleViewportChange);
    return () => desktopQuery.removeEventListener("change", handleViewportChange);
  }, []);

  useEffect(() => {
    if (!activeAncestorPaths?.length) {
      return;
    }

    // Route changes intentionally add to user-controlled expansion state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpandedPaths((currentPaths) =>
      mergeExpandedPaths(currentPaths, activeAncestorPaths),
    );
  }, [activeAncestorPaths]);

  function handleMemberChange(event: ChangeEvent<HTMLSelectElement>) {
    router.push(buildMemberHref(event.target.value));
  }

  function openExplorer() {
    explorerDialogRef.current?.showModal();
    setIsExplorerOpen(true);
  }

  function closeExplorer() {
    explorerDialogRef.current?.close();
  }

  function toggleDirectory(path: string) {
    setExpandedPaths((currentPaths) => {
      const nextPaths = new Set(currentPaths);

      if (nextPaths.has(path)) {
        nextPaths.delete(path);
      } else {
        nextPaths.add(path);
      }

      return nextPaths;
    });
  }

  const fileTree = tree.length ? (
    <TilTree
      nodes={tree}
      currentGithub={currentGithub}
      activeSlug={activeSlug}
      today={today}
      expandedPaths={expandedPaths}
      onToggleDirectory={toggleDirectory}
      onSelectFile={closeExplorer}
    />
  ) : (
    <p className={styles.emptyTree}>아직 TIL이 없습니다.</p>
  );

  return (
    <aside
      className={styles.sidebar}
      aria-label="TIL navigation"
      data-collapsed={!isSidebarOpen}
    >
      <div className={styles.sidebarHeader}>
        <Link
          className={styles.sidebarTitle}
          href="/"
          aria-label="He11divers TIL 홈"
        >
          <Image
            className={styles.sidebarLogo}
            src={siteIcon}
            alt=""
            width={40}
            height={40}
            priority
          />
          <span>He11divers TIL</span>
        </Link>
        <button
          className={styles.sidebarToggle}
          type="button"
          aria-label={isSidebarOpen ? "사이드바 닫기" : "사이드바 열기"}
          title={isSidebarOpen ? "사이드바 닫기" : "사이드바 열기"}
          aria-expanded={isSidebarOpen}
          aria-controls="til-sidebar-content"
          onClick={() => {
            closeExplorer();
            setIsSidebarOpen((open) => !open);
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M9 4v16" />
            <path d={isSidebarOpen ? "m15 9-3 3 3 3" : "m13 9 3 3-3 3"} />
          </svg>
        </button>
      </div>

      <div
        className={styles.sidebarContent}
        id="til-sidebar-content"
        inert={!isSidebarOpen}
      >
        <div className={styles.sidebarContentInner}>
          <div className={styles.memberSelector}>
            <label className={styles.memberLabel} htmlFor="til-member">
              스터디원
            </label>
            <div className={styles.memberSelectControl}>
              {currentMember ? (
                <Image
                  className={styles.memberAvatar}
                  src={buildGithubAvatarUrl(currentMember.github)}
                  alt=""
                  width={28}
                  height={28}
                  unoptimized
                />
              ) : null}
              <select
                className={styles.memberSelect}
                id="til-member"
                value={currentGithub}
                onChange={handleMemberChange}
              >
                {members.map((member) => (
                  <option key={member.github} value={member.github}>
                    {member.name} ({member.github})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <section
            className={styles.recentPosts}
            aria-labelledby="til-recent-posts-title"
          >
            <h2 className={styles.recentLabel} id="til-recent-posts-title">
              최신 글
            </h2>
            {recentFiles.length ? (
              <ol className={styles.recentList}>
                {recentFiles.map((file) => (
                  <li key={file.path}>
                    <Link
                      className={`${styles.fileLink} ${styles.recentLink} ${file.slug === activeSlug ? styles.activeFile : ""}`}
                      href={buildPostHref(currentGithub, file.slug)}
                      title={file.title}
                      aria-current={file.slug === activeSlug ? "page" : undefined}
                      onNavigate={closeExplorer}
                    >
                      <time
                        className={styles.fileDate}
                        dateTime={file.date}
                        data-recency={today ? getTilDateRecency(file.date, today) : 0}
                      >
                        {formatTilDate(file.date)}
                      </time>
                      <span className={styles.nodeName}>{file.title}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              <p className={styles.emptyRecent}>아직 작성한 글이 없습니다.</p>
            )}
          </section>

          <div className={styles.mobileExplorer}>
            <p className={styles.memberLabel}>목록</p>
            <button
              className={styles.explorerTrigger}
              type="button"
              aria-label={`TIL 파일 선택: ${activeFile?.title ?? "파일을 선택하세요"}`}
              aria-haspopup="dialog"
              aria-expanded={isExplorerOpen}
              aria-controls="til-file-dialog"
              onClick={openExplorer}
            >
              <span className={styles.nodeName}>
                {activeFile?.title ?? "파일을 선택하세요"}
              </span>
              <span className={styles.chevron} aria-hidden="true">▾</span>
            </button>
          </div>

          <nav className={styles.explorer} aria-label="TIL files">
            <p className={styles.explorerLabel}>목록</p>
            <div className={styles.treeViewport}>{fileTree}</div>
          </nav>
        </div>
      </div>

      <dialog
        ref={explorerDialogRef}
        className={styles.explorerDialog}
        id="til-file-dialog"
        aria-labelledby="til-file-dialog-title"
        onClose={() => setIsExplorerOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeExplorer();
          }
        }}
      >
        <div className={styles.dialogContent}>
          <header className={styles.dialogHeader}>
            <h2 className={styles.dialogTitle} id="til-file-dialog-title">
              TIL 파일 목록
            </h2>
            <button
              className={styles.dialogClose}
              type="button"
              aria-label="파일 목록 닫기"
              onClick={closeExplorer}
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>
          <nav className={styles.treeViewport} aria-label="TIL files">
            {fileTree}
          </nav>
        </div>
      </dialog>
    </aside>
  );
}
