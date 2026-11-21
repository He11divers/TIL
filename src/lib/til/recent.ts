import type { TilFileNode } from "./types";
import { compareTilPosts } from "./order.ts";

export function getRecentTilFiles(files: readonly TilFileNode[]): TilFileNode[] {
  return [...files].sort((left, right) =>
    right.date.localeCompare(left.date) ||
    (right.time ?? "00:00").localeCompare(left.time ?? "00:00") ||
    compareTilPosts(left, right)
  ).slice(0, 5);
}
