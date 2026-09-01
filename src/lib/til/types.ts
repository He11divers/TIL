export type TilDirectoryNode = {
  type: "directory";
  name: string;
  path: string;
  children: TilTreeNode[];
};

export type TilFileNode = {
  type: "file";
  name: string;
  path: string;
  slug: string;
};

export type TilTreeNode = TilDirectoryNode | TilFileNode;
