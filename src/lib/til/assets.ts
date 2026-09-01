import path from "node:path";

const IMAGE_CONTENT_TYPES = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
} as const;

function decodePathSegment(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function isExternalOrAbsoluteSource(source: string) {
  return (
    source.startsWith("/") ||
    source.startsWith("//") ||
    /^[a-z][a-z\d+.-]*:/i.test(source)
  );
}

function isOutsideRoot(relativePath: string) {
  return (
    relativePath === ".." ||
    relativePath.startsWith("../") ||
    path.posix.isAbsolute(relativePath)
  );
}

function getSourcePathname(source: string) {
  const suffixIndex = source.search(/[?#]/);

  return suffixIndex === -1 ? source : source.slice(0, suffixIndex);
}

export function getTilImageContentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  return IMAGE_CONTENT_TYPES[extension as keyof typeof IMAGE_CONTENT_TYPES];
}

export function resolveTilImageSource(
  source: string,
  github: string,
  postPath: string,
): string | null {
  if (isExternalOrAbsoluteSource(source)) {
    return source;
  }

  const sourcePath = getSourcePathname(source)
    .split("/")
    .map(decodePathSegment)
    .join("/")
    .replaceAll("\\", "/");

  if (!getTilImageContentType(sourcePath)) {
    return null;
  }

  const normalizedPostPath = path.posix.normalize(postPath);

  if (isOutsideRoot(normalizedPostPath)) {
    return null;
  }

  const resolvedPath = path.posix.normalize(
    path.posix.join(path.posix.dirname(normalizedPostPath), sourcePath),
  );

  if (isOutsideRoot(resolvedPath)) {
    return null;
  }

  const encodedPath = resolvedPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `/til-assets/${encodeURIComponent(github)}/${encodedPath}`;
}
