import assert from "node:assert/strict";
import test from "node:test";

import { getRecentTilFiles } from "../src/lib/til/recent.ts";

function file(title, date = "2026-10-17", path = `${title}.md`) {
  return { type: "file", name: path, title, date, path, slug: path.slice(0, -3) };
}

test("sorts newest dates first before comparing titles", () => {
  const files = [file("가방", "2026-10-15"), file("나무", "2026-10-17"), file("하늘", "2026-10-16")];
  assert.deepEqual(getRecentTilFiles(files).map(({ title }) => title), ["나무", "하늘", "가방"]);
});

test("sorts more than five same-day posts in Korean title order before truncating", () => {
  const files = ["하늘", "나무", "가방", "다리", "마음", "바다", "사과"].map((title) => file(title));
  assert.deepEqual(getRecentTilFiles(files).map(({ title }) => title), ["가방", "나무", "다리", "마음", "바다"]);
});

test("applies the title tie-breaker across the fifth-place cutoff", () => {
  const files = [
    file("최근 둘", "2026-10-16"),
    file("최근 하나", "2026-10-17"),
    ...["하늘", "나무", "가방", "다리", "마음", "바다"].map((title) => file(title, "2026-10-15")),
  ];
  assert.deepEqual(getRecentTilFiles(files).map(({ title }) => title), ["최근 하나", "최근 둘", "가방", "나무", "다리"]);
});

test("resolves equal titles by path without dropping posts", () => {
  const files = [file("동일 제목", "2026-10-17", "나/글.md"), file("동일 제목", "2026-10-17", "가/글.md")];
  assert.deepEqual(getRecentTilFiles(files).map(({ path }) => path), ["가/글.md", "나/글.md"]);
});

test("handles empty lists and fewer than five posts", () => {
  assert.deepEqual(getRecentTilFiles([]), []);
  const files = [file("하나")];
  assert.deepEqual(getRecentTilFiles(files), files);
});

test("preserves the caller's tree order and frozen file metadata", () => {
  const files = Object.freeze([Object.freeze(file("나무")), Object.freeze(file("가방"))]);
  const result = getRecentTilFiles(files);
  assert.deepEqual(files.map(({ title }) => title), ["나무", "가방"]);
  assert.deepEqual(result.map(({ title }) => title), ["가방", "나무"]);
});

test("sorts dates correctly across month and year boundaries", () => {
  const files = [file("연말", "2025-12-31"), file("이월", "2026-02-01"), file("연초", "2026-01-01")];
  assert.deepEqual(getRecentTilFiles(files).map(({ title }) => title), ["이월", "연초", "연말"]);
});
