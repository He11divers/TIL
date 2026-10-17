import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import {
  getMarkdownHeadings,
  remarkHeadingIds,
} from "../src/lib/til/markdown-headings.ts";

test("includes every heading level in document order", () => {
  const headings = getMarkdownHeadings("# 하나\n## 둘\n### 셋\n#### 넷\n##### 다섯\n###### 여섯");
  assert.deepEqual(headings.map(({ depth }) => depth), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(headings.map(({ title }) => title), ["하나", "둘", "셋", "넷", "다섯", "여섯"]);
});

test("ignores fenced and indented code and raw HTML", () => {
  const source = "```md\n# 코드\n```\n\n~~~\n## 코드\n~~~\n\n    ### 코드\n\n<h4>HTML</h4>\n\n# 실제 제목";
  assert.deepEqual(getMarkdownHeadings(source).map(({ title }) => title), ["실제 제목"]);
});

test("supports Setext headings and headings inside blockquotes", () => {
  const headings = getMarkdownHeadings("큰 제목\n===\n\n작은 제목\n---\n\n> ### 인용 제목");
  assert.deepEqual(headings.map(({ depth }) => depth), [1, 2, 3]);
});

test("extracts readable text from emphasis, links, code, images, and math", () => {
  const headings = getMarkdownHeadings("## **강조** [링크](https://example.com) `코드` ![그림](a.png) $x^2$");
  assert.equal(headings[0].title, "강조 링크 코드 그림 x^2");
});

test("omits inline HTML tags and preserves reference image alt text", () => {
  const headings = getMarkdownHeadings("# <b>제목</b> ![대체 텍스트][image]\n\n[image]: a.png");
  assert.equal(headings[0].title, "제목 대체 텍스트");
});

test("assigns unique IDs even when duplicate suffixes collide", () => {
  const headings = getMarkdownHeadings("# A\n# A\n# A-1\n# A\n# A-1");
  assert.equal(new Set(headings.map(({ id }) => id)).size, 5);
  assert.deepEqual(headings.slice(0, 3).map(({ id }) => id), ["til-heading-a", "til-heading-a-1", "til-heading-a-1-1"]);
});

test("normalizes Unicode and handles emoji-only or empty headings", () => {
  const headings = getMarkdownHeadings("# 한글 제목!\n# Ａ\n# A\n# 🎉\n#");
  assert.equal(headings[0].id, "til-heading-한글-제목");
  assert.equal(headings[2].id, "til-heading-a-1");
  assert.equal(headings[4].title, "제목 없는 문단");
  assert.equal(new Set(headings.map(({ id }) => id)).size, 5);
});

test("returns an empty TOC for content with no headings", () => {
  assert.deepEqual(getMarkdownHeadings("일반 문장\n\n- 목록\n\n```\n# 코드\n```"), []);
});

test("rendered anchor IDs exactly match the TOC, including duplicates and footnotes", () => {
  const source = "# 한글\n## **중복**\n### 중복\n#### 네 단계\n##### 다섯\n###### 여섯\n\n내용[^1]\n\n[^1]: 각주";
  const html = renderToStaticMarkup(createElement(Markdown, {
    remarkPlugins: [remarkGfm, remarkMath, remarkHeadingIds],
    skipHtml: true,
  }, source));
  const renderedIds = [...html.matchAll(/<h[1-6] id="(til-heading-[^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(renderedIds, getMarkdownHeadings(source).map(({ id }) => id));
  assert.equal(new Set(renderedIds).size, renderedIds.length);
});

test("heading IDs remain deterministic on repeated renders", () => {
  const source = "# 같은 제목\n## 같은 제목\n# 같은 제목-1";
  assert.deepEqual(getMarkdownHeadings(source), getMarkdownHeadings(source));
});
