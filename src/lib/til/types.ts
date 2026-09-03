export type TilDirectoryNode = {
  type: "directory";
  name: string;
  path: string;
  children: TilTreeNode[];
};

export type TilFileNode = {
  type: "file";
  name: string;
  title: string;
  date: string;
  path: string;
  slug: string;
};

export type TilTreeNode = TilDirectoryNode | TilFileNode;

export type TilFrontmatter = {
  title: string;
  date: string;
  description?: string;
};

export type ParsedTilMarkdown = {
  frontmatter: TilFrontmatter;
  content: string;
};

export type TilPost = {
  github: string;
  title: string;
  description?: string;
  date: string;
  path: string;
  slug: string;
};

export type TilPostDetail = TilPost & {
  content: string;
};

export type TilContributionDay = {
  date: string;
  count: number;
};

export type MemberTilSummary = {
  github: string;
  name: string;
  totalPosts: number;
  recentPosts: TilPost[];
  contributions: TilContributionDay[];
};

export type TilSummaryOptions = {
  recentPostLimit?: number;
};
