import "server-only";

import path from "node:path";

import { study } from "../../../study.config";
import { scanTilTree } from "./scanner";

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
