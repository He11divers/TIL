import type { TilFileNode } from "./types";
import { compareTilPosts } from "./order.ts";

export function getRecentTilFiles(files: readonly TilFileNode[]): TilFileNode[] {
  // Select the latest five, then display them in the same order as the explorer.
  return [...files].sort(compareTilPosts).slice(-5);
}
