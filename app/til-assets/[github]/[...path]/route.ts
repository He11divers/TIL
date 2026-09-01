import { readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";

import { getTilImageContentType } from "@/src/lib/til/assets";
import { study } from "@/study.config";

export const runtime = "nodejs";

function notFoundResponse() {
  return new Response(null, { status: 404 });
}

function isNotFoundError(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return false;
  }

  return error.code === "ENOENT" || error.code === "ENOTDIR";
}

function isWithinDirectory(directory: string, candidate: string) {
  const relativePath = path.relative(directory, candidate);

  return (
    relativePath === "" ||
    (!path.isAbsolute(relativePath) &&
      relativePath !== ".." &&
      !relativePath.startsWith(`..${path.sep}`))
  );
}

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      github: string;
      path: string[];
    }>;
  },
) {
  const { github, path: assetSegments } = await context.params;
  const member = study.members.find((candidate) => candidate.github === github);

  if (!member || assetSegments.length === 0) {
    return notFoundResponse();
  }

  const contentType = getTilImageContentType(assetSegments.at(-1) ?? "");

  if (!contentType) {
    return notFoundResponse();
  }

  const memberRoot = path.resolve(process.cwd(), "raw", member.github);
  const requestedPath = path.resolve(memberRoot, ...assetSegments);

  if (!isWithinDirectory(memberRoot, requestedPath)) {
    return notFoundResponse();
  }

  try {
    const [resolvedMemberRoot, resolvedAssetPath] = await Promise.all([
      realpath(memberRoot),
      realpath(requestedPath),
    ]);

    if (!isWithinDirectory(resolvedMemberRoot, resolvedAssetPath)) {
      return notFoundResponse();
    }

    const assetStats = await stat(resolvedAssetPath);

    if (!assetStats.isFile()) {
      return notFoundResponse();
    }

    const asset = await readFile(resolvedAssetPath);

    return new Response(asset, {
      headers: {
        "Content-Length": String(asset.byteLength),
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      return notFoundResponse();
    }

    throw error;
  }
}
