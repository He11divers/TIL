"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./FolderPosts.module.css";

export function PostPreviewImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return <Image className={styles.thumbnail} src={src} alt={alt} width={176} height={112}
    unoptimized onError={() => setFailed(true)} />;
}
