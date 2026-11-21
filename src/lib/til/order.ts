type DatedPost = { date: string; time?: string; title: string; path: string };

const collator = new Intl.Collator("ko");

export function compareTilPosts(left: DatedPost, right: DatedPost) {
  return left.date.localeCompare(right.date) ||
    (left.time ?? "00:00").localeCompare(right.time ?? "00:00") ||
    collator.compare(left.title, right.title) ||
    collator.compare(left.path, right.path);
}
