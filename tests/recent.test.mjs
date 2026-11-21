import assert from "node:assert/strict";
import test from "node:test";
import { getRecentTilFiles } from "../src/lib/til/recent.ts";
import { compareTilPosts } from "../src/lib/til/order.ts";
import { parseTilMarkdown } from "../src/lib/til/parser.ts";

function file(title, date = "2026-10-17", time, path = `${title}.md`) {
  return { type: "file", name: path, title, date, time, path, slug: path.slice(0, -3) };
}

test("orders by date, optional time, Korean title, then path", () => {
  const files = [file("하늘", "2026-10-17", "09:00"), file("나무"), file("가방"), file("먼저", "2025-12-31", "23:59"), file("아침", "2026-10-17", "08:00")];
  assert.deepEqual(files.sort(compareTilPosts).map(f => f.title), ["하늘", "아침", "가방", "나무", "먼저"]);
});

test("uses title order for equal timestamps before selecting the latest five without mutation", () => {
  const files = Object.freeze(["하늘", "나무", "가방", "다리", "마음", "바다", "사과"].map(title => Object.freeze(file(title))));
  assert.deepEqual(getRecentTilFiles(files).map(f => f.title), ["가방", "나무", "다리", "마음", "바다"]);
  assert.equal(files[0].title, "하늘");
  assert.deepEqual(getRecentTilFiles([]), []);
  assert.deepEqual(getRecentTilFiles([file("하나")]), [file("하나")]);
});

test("recent posts and folder lists both use newest date and time first", () => {
  const files = [file("과거", "2025-12-31", "23:59"), file("자정", "2026-01-01"), file("오전", "2026-01-01", "09:00"), file("저녁", "2026-01-01", "21:00")];
  assert.deepEqual(getRecentTilFiles(files).map(f => f.title), ["저녁", "오전", "자정", "과거"]);
  assert.deepEqual([...files].sort(compareTilPosts).map(f => f.title), ["저녁", "오전", "자정", "과거"]);
});

test("uses path to break equal titles and missing time equals midnight", () => {
  const files = [file("같음", undefined, "00:00", "나/글.md"), file("같음", undefined, undefined, "가/글.md")];
  assert.deepEqual(files.sort(compareTilPosts).map(f => f.path), ["가/글.md", "나/글.md"]);
});

function markdown(timeLine = "", description = "") {
  return `---\ntitle: 테스트\ndate: "2026-11-21"\n${timeLine}${description}---\n\n본문`;
}

test("parses optional creation time with and without description, preserving legacy posts", () => {
  assert.equal(parseTilMarkdown(markdown()).frontmatter.time, undefined);
  for (const time of ["00:00", "09:30", "23:59"]) {
    for (const description of ["", "description: 설명\n"]) {
      const parsed = parseTilMarkdown(markdown(`time: "${time}"\n`, description));
      assert.equal(parsed.frontmatter.time, time);
      assert.equal(parsed.content, "본문");
    }
  }
});

test("rejects invalid time metadata with source context", () => {
  for (const value of ['"24:00"', '"9:30"', '"12:60"', '""', 'null', '123', '[]']) {
    assert.throws(() => parseTilMarkdown(markdown(`time: ${value}\n`), "raw/test.md"), /raw\/test.md.*time/);
  }
});
