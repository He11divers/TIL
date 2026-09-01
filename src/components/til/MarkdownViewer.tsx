import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import styles from "./MarkdownViewer.module.css";

type MarkdownViewerProps = {
  content: string;
};

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <div className={styles.markdown}>
      <Markdown remarkPlugins={[remarkGfm]} skipHtml>
        {content}
      </Markdown>
    </div>
  );
}
