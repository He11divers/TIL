import "server-only";

import path from "node:path";

import { study } from "../../../study.config";
import { scanTilTree } from "./scanner";
import type { TilFileNode, TilTreeNode } from "./types";

export function flattenTilFiles(nodes: TilTreeNode[]): TilFileNode[] {
  return nodes.flatMap((node) =>
    node.type === "file" ? [node] : flattenTilFiles(node.children),
  );
}

export async function getMemberTree(github: string) {
  const member = study.members.find((candidate) => candidate.github === github);

  if (!member) {
    return null;
  }

  const memberDirectory = path.join(process.cwd(), "raw", member.github);

  return {
    github: member.github,
    name: member.name,
    children: await scanTilTree(memberDirectory),
  };
}
