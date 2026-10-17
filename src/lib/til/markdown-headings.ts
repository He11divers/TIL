import type { Nodes, Root } from "mdast";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";

export type MarkdownHeading = {
  id: string;
  title: string;
  depth: number;
};

function getNodeText(node: Nodes): string {
  if (node.type === "image" || node.type === "imageReference") {
    return node.alt ?? "";
  }

  if (node.type === "html") {
    return "";
  }

  if ("value" in node) {
    return node.value;
  }

  return "children" in node ? node.children.map(getNodeText).join("") : "";
}

function assignHeadingIds(tree: Root): MarkdownHeading[] {
  const headings: MarkdownHeading[] = [];
  const usedIds = new Set<string>();

  function visit(node: Nodes) {
    if (node.type === "heading") {
      const title = getNodeText(node).replace(/\s+/g, " ").trim();
      const slug = title
        .normalize("NFKC")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, "")
        .replace(/\s+/g, "-") || "section";
      const baseId = `til-heading-${slug}`;
      let id = baseId;
      let suffix = 1;

      while (usedIds.has(id)) {
        id = `${baseId}-${suffix++}`;
      }

      usedIds.add(id);
      node.data = {
        ...node.data,
        hProperties: { ...node.data?.hProperties, id },
      };
      headings.push({ id, title: title || "제목 없는 문단", depth: node.depth });
    }

    if ("children" in node) {
      node.children.forEach(visit);
    }
  }

  visit(tree);
  return headings;
}

export function remarkHeadingIds() {
  return (tree: Root) => {
    assignHeadingIds(tree);
  };
}

export function getMarkdownHeadings(content: string): MarkdownHeading[] {
  const tree = unified().use(remarkParse).use(remarkGfm).use(remarkMath).parse(content);
  return assignHeadingIds(tree);
}
