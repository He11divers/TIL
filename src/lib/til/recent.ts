import type { TilFileNode } from "./types";

const titleCollator = new Intl.Collator("ko");

export function getRecentTilFiles(files: readonly TilFileNode[]): TilFileNode[] {
  return [...files].sort((left, right) => {
    if (left.date !== right.date) {
      return left.date > right.date ? -1 : 1;
    }

    return (
      titleCollator.compare(left.title, right.title) ||
      titleCollator.compare(left.path, right.path)
    );
  }).slice(0, 5);
}
