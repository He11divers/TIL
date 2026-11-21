import type { Nodes } from "mdast";
import { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { resolveTilImageSource } from "./assets.ts";

export type TilPreviewImage = { src: string; alt: string };

const parser = unified().use(remarkParse).use(remarkGfm).use(remarkMath);

export function getFirstTilImage(content: string, github: string, postPath: string): TilPreviewImage | undefined {
  const tree = parser.parse(content);
  const definitions = new Map<string, string>();

  function collectDefinitions(node: Nodes) {
    if (node.type === "definition" && !definitions.has(node.identifier)) {
      definitions.set(node.identifier, node.url);
    }
    if ("children" in node) node.children.forEach(collectDefinitions);
  }
  collectDefinitions(tree);

  function findImage(node: Nodes): TilPreviewImage | undefined {
    const source = node.type === "image" ? node.url
      : node.type === "imageReference" ? definitions.get(node.identifier) : undefined;
    if (source) {
      const safeSource = defaultUrlTransform(source);
      const src = safeSource ? resolveTilImageSource(safeSource, github, postPath) : null;
      if (src && (src.startsWith("/") || /^https?:\/\//i.test(src))) {
        return { src, alt: "alt" in node ? node.alt ?? "" : "" };
      }
    }
    if ("children" in node) {
      for (const child of node.children) {
        const image = findImage(child);
        if (image) return image;
      }
    }
    return undefined;
  }
  return findImage(tree);
}
