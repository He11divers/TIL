import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { parseTilMarkdown } from "./parser";
import { flattenTilFiles, getMemberTree } from "./tree";
import type { TilPostDetail } from "./types";

export async function getPost(
  github: string,
  slug: string,
): Promise<TilPostDetail | null> {
  const tree = await getMemberTree(github);

  if (!tree) {
    return null;
  }

  const file = flattenTilFiles(tree.children).find(
    (candidate) => candidate.slug === slug,
  );

  if (!file) {
    return null;
  }

  const sourcePath = path.posix.join("raw", tree.github, file.path);
  const filePath = path.join(process.cwd(), ...sourcePath.split("/"));
  const source = await readFile(filePath, "utf8");
  const { frontmatter, content } = parseTilMarkdown(source, sourcePath);

  return {
    github: tree.github,
    title: frontmatter.title,
    ...(frontmatter.description === undefined
      ? {}
      : { description: frontmatter.description }),
    date: frontmatter.date,
    path: file.path,
    slug: file.slug,
    content,
  };
}
