import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { study } from "../../../study.config";
import { parseTilMarkdown } from "./parser";
import { flattenTilFiles, getMemberTree } from "./tree";
import type { TilPost } from "./types";

function compareText(left: string, right: string) {
  if (left === right) {
    return 0;
  }

  return left < right ? -1 : 1;
}

function compareMemberPosts(left: TilPost, right: TilPost) {
  const dateOrder = compareText(right.date, left.date);

  return dateOrder || compareText(left.path, right.path);
}

function compareAllPosts(left: TilPost, right: TilPost) {
  const dateOrder = compareText(right.date, left.date);

  if (dateOrder) {
    return dateOrder;
  }

  const githubOrder = compareText(left.github, right.github);

  return githubOrder || compareText(left.path, right.path);
}

export async function getMemberPosts(
  github: string,
): Promise<TilPost[] | null> {
  const tree = await getMemberTree(github);

  if (!tree) {
    return null;
  }

  const posts = await Promise.all(
    flattenTilFiles(tree.children).map(async (file) => {
      const sourcePath = path.posix.join("raw", tree.github, file.path);
      const filePath = path.join(process.cwd(), ...sourcePath.split("/"));
      const source = await readFile(filePath, "utf8");
      const { frontmatter } = parseTilMarkdown(source, sourcePath);

      return {
        github: tree.github,
        title: frontmatter.title,
        ...(frontmatter.description === undefined
          ? {}
          : { description: frontmatter.description }),
        date: frontmatter.date,
        path: file.path,
        slug: file.slug,
      };
    }),
  );

  return posts.sort(compareMemberPosts);
}

export async function getAllPosts(): Promise<TilPost[]> {
  const memberPosts = await Promise.all(
    study.members.map(async (member) => {
      const posts = await getMemberPosts(member.github);

      if (!posts) {
        throw new Error(
          `Registered study member "${member.github}" could not be found.`,
        );
      }

      return posts;
    }),
  );

  return memberPosts.flat().sort(compareAllPosts);
}
