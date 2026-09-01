import "server-only";

import { readdir } from "node:fs/promises";
import path from "node:path";

import type { TilTreeNode } from "./types";

function compareNodes(left: TilTreeNode, right: TilTreeNode) {
  if (left.type !== right.type) {
    return left.type === "directory" ? -1 : 1;
  }

  if (left.name === right.name) {
    return 0;
  }

  return left.name < right.name ? -1 : 1;
}

async function scanDirectory(
  directory: string,
  relativeDirectory: string,
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
        children: await scanDirectory(entryPath, relativePath),
      });
      continue;
    }

    if (entry.isFile() && path.extname(entry.name) === ".md") {
      nodes.push({
        type: "file",
        name: entry.name,
        path: relativePath,
        slug: relativePath.slice(0, -path.extname(relativePath).length),
      });
    }
  }

  return nodes.sort(compareNodes);
}

export function scanTilTree(directory: string): Promise<TilTreeNode[]> {
  return scanDirectory(directory, "");
}
