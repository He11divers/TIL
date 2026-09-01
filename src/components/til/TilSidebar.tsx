"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ChangeEvent,
} from "react";

import type { TilTreeNode } from "@/src/lib/til/types";
import siteIcon from "@/app/icon.png";
import { buildGithubAvatarUrl } from "@/src/lib/github";

import styles from "./TilSidebar.module.css";

type MemberOption = {
  name: string;
  github: string;
};

type TilSidebarProps = {
  members: MemberOption[];
  currentGithub: string;
  tree: TilTreeNode[];
  activeSlug?: string;
};

type TilTreeProps = {
  nodes: TilTreeNode[];
  currentGithub: string;
  activeSlug?: string;
  expandedPaths: Set<string>;
  onToggleDirectory: (path: string) => void;
  depth?: number;
};

function findActiveAncestors(
  nodes: TilTreeNode[],
  activeSlug: string,
  ancestors: string[] = [],
): string[] | null {
  for (const node of nodes) {
    if (node.type === "file") {
      if (node.slug === activeSlug) {
        return ancestors;
      }

      continue;
    }

    const result = findActiveAncestors(node.children, activeSlug, [
      ...ancestors,
      node.path,
    ]);

    if (result) {
      return result;
    }
  }

  return null;
}

function getActiveAncestorPaths(nodes: TilTreeNode[], activeSlug?: string) {
  if (!activeSlug) {
    return [];
  }

  return findActiveAncestors(nodes, activeSlug) ?? [];
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
  expandedPaths,
  onToggleDirectory,
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
                  expandedPaths={expandedPaths}
                  onToggleDirectory={onToggleDirectory}
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
            >
              <span className={styles.fileMarker} aria-hidden="true">
                {isActive ? "●" : ""}
              </span>
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
  activeSlug,
}: TilSidebarProps) {
  const router = useRouter();
  const currentMember = members.find(
    (member) => member.github === currentGithub,
  );
  const activeAncestorPaths = useMemo(
    () => getActiveAncestorPaths(tree, activeSlug),
    [activeSlug, tree],
  );
  const [expandedPaths, setExpandedPaths] = useState(
    () => new Set(activeAncestorPaths),
  );

  useEffect(() => {
    if (!activeAncestorPaths.length) {
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

  return (
    <aside className={styles.sidebar} aria-label="TIL navigation">
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

      <nav className={styles.explorer} aria-label="TIL files">
        <p className={styles.explorerLabel}>목록</p>
        <div className={styles.treeViewport}>
          {tree.length ? (
            <TilTree
              nodes={tree}
              currentGithub={currentGithub}
              activeSlug={activeSlug}
              expandedPaths={expandedPaths}
              onToggleDirectory={toggleDirectory}
            />
          ) : (
            <p className={styles.emptyTree}>아직 TIL이 없습니다.</p>
          )}
        </div>
      </nav>
    </aside>
  );
}
