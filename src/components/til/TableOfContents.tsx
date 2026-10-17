"use client";

import { useEffect, useState, type CSSProperties } from "react";

import type { MarkdownHeading } from "@/src/lib/til/markdown-headings";

import styles from "./TableOfContents.module.css";

type TableOfContentsProps = {
  headings: MarkdownHeading[];
  contentId: string;
};

export function TableOfContents({ headings, contentId }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | undefined>(headings[0]?.id);
  const [isOpen, setIsOpen] = useState(false);
  const minimumDepth = Math.min(...headings.map((heading) => heading.depth));

  useEffect(() => {
    const content = document.getElementById(contentId);
    const elements = headings.flatMap(({ id }) => {
      const element = document.getElementById(id);
      return element ? [element] : [];
    });
    let frameId = 0;

    function updateActiveHeading() {
      frameId = 0;
      let current: HTMLElement | undefined = elements[0];

      for (const element of elements) {
        if (element.getBoundingClientRect().top <= 96) {
          current = element;
        }
      }

      if (
        window.scrollY > 0 &&
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      ) {
        current = elements.at(-1);
      }

      setActiveId(current?.id);
    }

    function scheduleUpdate() {
      if (!frameId) {
        frameId = window.requestAnimationFrame(updateActiveHeading);
      }
    }

    const observer = new ResizeObserver(scheduleUpdate);
    if (content) {
      observer.observe(content);
    }
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [headings, contentId]);

  if (!headings.length) {
    return null;
  }

  return (
    <nav className={styles.toc} aria-label="본문 목차" data-open={isOpen}>
      <h2 className={styles.desktopTitle}>목차</h2>
      <button
        className={styles.mobileToggle}
        type="button"
        aria-expanded={isOpen}
        aria-controls="til-table-of-contents"
        onClick={() => setIsOpen((open) => !open)}
      >
        목차
        <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
      </button>
      <ol className={styles.list} id="til-table-of-contents">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              className={styles.link}
              href={`#${encodeURIComponent(heading.id)}`}
              aria-current={activeId === heading.id ? "location" : undefined}
              style={{ "--toc-depth": heading.depth - minimumDepth } as CSSProperties}
              onClick={() => setIsOpen(false)}
            >
              {heading.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
