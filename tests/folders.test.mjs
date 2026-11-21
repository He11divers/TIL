import assert from "node:assert/strict";
import test from "node:test";
import { countFolderPosts, findTilDirectory, getFolderFiles } from "../src/lib/til/folders.ts";
import { buildFolderHref, buildPostHref } from "../src/lib/til/navigation.ts";
const file = (title, path, date = "2026-01-01") => ({type:"file", title, name: title, path, slug:path.slice(0,-3), date});
const nested = {type:"directory", name:"한글 #", path:"A/한글 #", children:[file("먼저", "A/한글 #/글.md")]};
const tree = [{type:"directory", name:"A", path:"A", children:[file("나중", "A/글.md", "2026-02-01"), nested]}, {type:"directory", name:"AB", path:"AB", children:[file("다른 폴더", "AB/글.md")]}, {type:"directory", name:"images", path:"images", children:[]}];

test("counts category posts recursively, including empty folders and root posts", () => {
  assert.equal(countFolderPosts(tree), 3);
  assert.equal(countFolderPosts(tree[0].children), 2);
  assert.equal(countFolderPosts(nested.children), 1);
  assert.equal(countFolderPosts(tree[2].children), 0);
  assert.equal(countFolderPosts([...tree, file("루트 글", "root.md")]), 4);
});

test("finds exact folders, including nested and empty folders, rejecting unknown paths", () => {
  assert.equal(findTilDirectory(tree, "A/한글 #"), nested);
  for (const path of ["../A", "a", "A/", "A/missing"]) assert.equal(findTilDirectory(tree, path), null);
  assert.deepEqual(getFolderFiles(findTilDirectory(tree, "images").children), []);
});

test("includes descendants only, with global chronological order and no tree mutation", () => {
  const before = JSON.stringify(tree);
  assert.deepEqual(getFolderFiles(findTilDirectory(tree, "A").children).map(f => f.title), ["먼저", "나중"]);
  assert.equal(getFolderFiles(tree).length, 3);
  assert.equal(JSON.stringify(tree), before);
});

test("encodes folder queries and post segments without changing route boundaries", () => {
  assert.equal(buildFolderHref("user"), "/til/user");
  assert.equal(buildFolderHref("user", "A/한글 #"), "/til/user?folder=A%2F%ED%95%9C%EA%B8%80%20%23");
  assert.equal(buildPostHref("user", "A/한글 #"), "/til/user/A/%ED%95%9C%EA%B8%80%20%23");
});
