import "server-only";

import Markdown, {
  defaultUrlTransform,
  type UrlTransform,
} from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeMathjax from "rehype-mathjax";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { resolveTilImageSource } from "@/src/lib/til/assets";

import styles from "./MarkdownViewer.module.css";

type MarkdownViewerProps = {
  content: string;
  github: string;
  postPath: string;
};

function createUrlTransform(github: string, postPath: string): UrlTransform {
  return (url, key, node) => {
    const safeUrl = defaultUrlTransform(url);

    if (!safeUrl || key !== "src" || node.tagName !== "img") {
      return safeUrl;
    }

    return resolveTilImageSource(safeUrl, github, postPath);
  };
}

export function MarkdownViewer({
  content,
  github,
  postPath,
}: MarkdownViewerProps) {
  return (
    <div className={styles.markdown}>
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          [rehypeHighlight, { detect: false, plainText: ["math"] }],
          rehypeMathjax,
        ]}
        skipHtml
        urlTransform={createUrlTransform(github, postPath)}
      >
        {content}
      </Markdown>
    </div>
  );
}
