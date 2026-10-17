"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { buildGithubAvatarUrl } from "@/src/lib/github";
import type { StudyMember } from "@/study.config";

import styles from "./MemberSelector.module.css";

type MemberSelectorProps = {
  members: StudyMember[];
  currentGithub: string;
  disabled?: boolean;
};

export function MemberSelector({ members, currentGithub, disabled }: MemberSelectorProps) {
  const router = useRouter();
  const id = useId();
  const listId = `${id}-listbox`;
  const currentIndex = Math.max(0, members.findIndex((member) => member.github === currentGithub));
  const currentMember = members[currentIndex];
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [position, setPosition] = useState({ left: 0, top: 0, width: 0, maxHeight: 320 });

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;

    const rect = trigger.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom - 14;
    const above = rect.top - 14;
    const showBelow = below >= Math.min(160, above);
    const maxHeight = Math.max(0, Math.min(320, showBelow ? below : above));
    const height = Math.min(maxHeight, menu.scrollHeight + 2);

    setPosition({
      left: Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8)),
      top: showBelow ? rect.bottom + 6 : Math.max(8, rect.top - height - 6),
      width: rect.width,
      maxHeight,
    });
  }, []);

  function closeMenu() {
    if (menuRef.current?.matches(":popover-open")) {
      menuRef.current.hidePopover();
    }
    setIsOpen(false);
  }

  function openMenu(index = currentIndex) {
    if (disabled || !members.length) return;
    setActiveIndex(index);
    if (!menuRef.current?.matches(":popover-open")) {
      menuRef.current?.showPopover();
    }
    updatePosition();
    setIsOpen(true);
  }

  function selectMember(index: number) {
    const member = members[index];
    if (!member) return;
    closeMenu();
    triggerRef.current?.focus({ preventScroll: true });
    if (member.github !== currentGithub) {
      router.push(`/til/${encodeURIComponent(member.github)}`);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    const opened = menuRef.current?.matches(":popover-open");

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        if (!opened) {
          openMenu();
        } else {
          const step = event.key === "ArrowDown" ? 1 : -1;
          setActiveIndex((index) => (index + step + members.length) % members.length);
        }
        break;
      case "Home":
      case "End":
        event.preventDefault();
        openMenu(event.key === "Home" ? 0 : members.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (opened) selectMember(activeIndex);
        else openMenu();
        break;
      case "Escape":
        if (opened) {
          event.preventDefault();
          closeMenu();
          triggerRef.current?.focus({ preventScroll: true });
        }
        break;
      case "Tab":
        if (opened) closeMenu();
        break;
    }
  }

  useEffect(() => {
    if (disabled && menuRef.current?.matches(":popover-open")) {
      menuRef.current.hidePopover();
    }
  }, [disabled]);

  useEffect(() => {
    if (!isOpen) return;

    function handleScroll(event: Event) {
      if (event.target instanceof Node && menuRef.current?.contains(event.target)) return;
      updatePosition();
    }

    const observer = new ResizeObserver(updatePosition);
    if (triggerRef.current) observer.observe(triggerRef.current);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, updatePosition]);

  useLayoutEffect(() => {
    if (isOpen) {
      document.getElementById(`${listId}-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, activeIndex, listId]);

  return (
    <div className={styles.selector}>
      <label className={styles.label} id={`${id}-label`} htmlFor={`${id}-trigger`}>
        스터디원
      </label>
      <button
        ref={triggerRef}
        className={styles.trigger}
        id={`${id}-trigger`}
        type="button"
        role="combobox"
        aria-labelledby={`${id}-label ${id}-current`}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-expanded={isOpen}
        aria-activedescendant={isOpen ? `${listId}-option-${activeIndex}` : undefined}
        disabled={disabled || !members.length}
        onClick={() => isOpen ? closeMenu() : openMenu()}
        onKeyDown={handleKeyDown}
      >
        {currentMember ? (
          <>
            <Image className={styles.avatar} src={buildGithubAvatarUrl(currentMember.github)} alt="" width={32} height={32} unoptimized />
            <span className={styles.memberText} id={`${id}-current`}>
              <span className={styles.name}>{currentMember.name}</span>
              <span className={styles.github}>@{currentMember.github}</span>
            </span>
          </>
        ) : <span id={`${id}-current`}>스터디원 선택</span>}
        <svg className={styles.chevron} viewBox="0 0 16 16" aria-hidden="true" data-open={isOpen}>
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>

      <div
        ref={menuRef}
        className={styles.menu}
        id={listId}
        role="listbox"
        aria-label="스터디원 선택"
        popover="auto"
        style={position}
        onToggle={(event) => setIsOpen(event.currentTarget.matches(":popover-open"))}
        onKeyDown={handleKeyDown}
      >
        {members.map((member, index) => (
          <div
            className={styles.option}
            id={`${listId}-option-${index}`}
            key={member.github}
            role="option"
            aria-selected={member.github === currentGithub}
            data-active={activeIndex === index}
            onMouseDown={(event) => event.preventDefault()}
            onMouseMove={() => setActiveIndex(index)}
            onClick={() => selectMember(index)}
          >
            <Image className={styles.avatar} src={buildGithubAvatarUrl(member.github)} alt="" width={32} height={32} unoptimized />
            <span className={styles.memberText}>
              <span className={styles.name}>{member.name}</span>
              <span className={styles.github}>@{member.github}</span>
            </span>
            {member.github === currentGithub ? <span className={styles.checkmark} aria-hidden="true">✓</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
