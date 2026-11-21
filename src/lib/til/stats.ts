import "server-only";

import { study, type StudyMember } from "../../../study.config";
import { getMemberPosts } from "./posts";
import type {
  MemberTilSummary,
  TilContributionDay,
  TilPost,
  TilSummaryOptions,
} from "./types";

const DEFAULT_RECENT_POST_LIMIT = 3;

function getRecentPostLimit(options?: TilSummaryOptions) {
  const recentPostLimit =
    options?.recentPostLimit ?? DEFAULT_RECENT_POST_LIMIT;

  if (!Number.isInteger(recentPostLimit) || recentPostLimit <= 0) {
    throw new Error('"recentPostLimit" must be a positive integer.');
  }

  return recentPostLimit;
}

export function aggregateContributions(
  posts: readonly TilPost[],
): TilContributionDay[] {
  const countsByDate = new Map<string, number>();

  for (const post of posts) {
    countsByDate.set(post.date, (countsByDate.get(post.date) ?? 0) + 1);
  }

  return Array.from(countsByDate, ([date, count]) => ({ date, count })).sort(
    (left, right) => {
      if (left.date === right.date) {
        return 0;
      }

      return left.date < right.date ? -1 : 1;
    },
  );
}

async function createMemberTilSummary(
  member: StudyMember,
  recentPostLimit: number,
): Promise<MemberTilSummary> {
  const posts = await getMemberPosts(member.github);

  if (!posts) {
    throw new Error(
      `Registered study member "${member.github}" could not be found.`,
    );
  }

  return {
    github: member.github,
    name: member.name,
    totalPosts: posts.length,
    recentPosts: posts.slice(0, recentPostLimit),
    contributions: aggregateContributions(posts),
  };
}

export async function getMemberTilSummary(
  github: string,
  options?: TilSummaryOptions,
): Promise<MemberTilSummary | null> {
  const recentPostLimit = getRecentPostLimit(options);
  const member = study.members.find((candidate) => candidate.github === github);

  if (!member) {
    return null;
  }

  return createMemberTilSummary(member, recentPostLimit);
}

export async function getAllMemberTilSummaries(
  options?: TilSummaryOptions,
): Promise<MemberTilSummary[]> {
  const recentPostLimit = getRecentPostLimit(options);

  return Promise.all(
    study.members.map((member) =>
      createMemberTilSummary(member, recentPostLimit),
    ),
  );
}
