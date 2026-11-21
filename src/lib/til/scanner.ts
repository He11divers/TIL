import "server-only";

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { parseTilMarkdown } from "./parser";
import { compareTilPosts } from "./order";
import { getFirstTilImage } from "./preview";
import type { TilTreeNode } from "./types";

function compareNodes(left: TilTreeNode, right: TilTreeNode) {
  if (left.type !== right.type) {
    return left.type === "directory" ? -1 : 1;
  }

  if (left.type === "file" && right.type === "file") {
    return compareTilPosts(left, right);
  }

  if (left.name === right.name) {
    return 0;
  }

  return left.name < right.name ? -1 : 1;
}

async function scanDirectory(
  directory: string,
  relativeDirectory: string,
  github: string,
): Promise<TilTreeNode[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nodes: TilTreeNode[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    const relativePath = path.posix.join(relativeDirectory, entry.name);

    if (entry.isDirectory()) {
      nodes.push({
        type: "directory",
        name: entry.name,
        path: relativePath,
        children: await scanDirectory(entryPath, relativePath, github),
      });
      continue;
    }

    if (entry.isFile() && path.extname(entry.name) === ".md") {
      const source = await readFile(entryPath, "utf8");
      const { frontmatter, content } = parseTilMarkdown(source, entryPath);
      const previewImage = getFirstTilImage(content, github, relativePath);

      nodes.push({
        type: "file",
        name: entry.name,
        title: frontmatter.title,
        ...(previewImage ? { previewImage } : {}),
        ...(frontmatter.description === undefined ? {} : { description: frontmatter.description }),
        date: frontmatter.date,
        ...(frontmatter.time === undefined ? {} : { time: frontmatter.time }),
        path: relativePath,
        slug: relativePath.slice(0, -path.extname(relativePath).length),
      });
    }
  }

  return nodes.sort(compareNodes);
}

export function scanTilTree(directory: string, github: string): Promise<TilTreeNode[]> {
  return scanDirectory(directory, "", github);
}
