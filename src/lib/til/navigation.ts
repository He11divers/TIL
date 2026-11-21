export function buildMemberHref(github: string) {
  return `/til/${encodeURIComponent(github)}`;
}

export function buildFolderHref(github: string, folder = "") {
  const href = buildMemberHref(github);
  return folder ? `${href}?folder=${encodeURIComponent(folder)}` : href;
}

export function buildPostHref(github: string, slug: string) {
  return `${buildMemberHref(github)}/${slug.split("/").map(encodeURIComponent).join("/")}`;
}
