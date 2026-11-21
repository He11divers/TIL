type DatedPost = { date: string; time?: string; title: string; path: string };

const collator = new Intl.Collator("ko");

export function compareTilPosts(left: DatedPost, right: DatedPost) {
  return right.date.localeCompare(left.date) ||
    (right.time ?? "00:00").localeCompare(left.time ?? "00:00") ||
    collator.compare(left.title, right.title) ||
    collator.compare(left.path, right.path);
}
