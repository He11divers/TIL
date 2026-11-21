import { compareTilPosts } from "./order.ts";
import type { TilDirectoryNode, TilFileNode, TilTreeNode } from "./types";

export function findTilDirectory(nodes: TilTreeNode[], path: string): TilDirectoryNode | null {
  for (const node of nodes) {
    if (node.type !== "directory") continue;
    if (node.path === path) return node;
    const child = findTilDirectory(node.children, path);
    if (child) return child;
  }
  return null;
}

export function getFolderFiles(nodes: TilTreeNode[]): TilFileNode[] {
  return nodes.flatMap(node => node.type === "file" ? [node] : getFolderFiles(node.children))
    .sort(compareTilPosts);
}
