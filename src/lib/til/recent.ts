import type { TilFileNode } from "./types";
import { compareTilPosts } from "./order.ts";

export function getRecentTilFiles(files: readonly TilFileNode[]): TilFileNode[] {
  return [...files].sort(compareTilPosts).slice(0, 5);
}
