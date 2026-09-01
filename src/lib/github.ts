export function buildGithubHref(github: string) {
  return `https://github.com/${encodeURIComponent(github)}`;
}

export function buildGithubAvatarUrl(github: string) {
  return `${buildGithubHref(github)}.png?size=160`;
}
