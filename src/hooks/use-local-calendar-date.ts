"use client";

import { useSyncExternalStore } from "react";

function getBrowserCalendarDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getServerSnapshot() {
  // The browser's clock and time zone are unknown during SSR and hydration.
  return null;
}

function subscribe(onChange: () => void) {
  let timeoutId: number;

  function scheduleRefresh() {
    window.clearTimeout(timeoutId);

    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);

    // Refresh at local midnight, and check for clock/time-zone changes each minute.
    timeoutId = window.setTimeout(
      refresh,
      Math.min(midnight.getTime() - now.getTime(), 60_000),
    );
  }

  function refresh() {
    onChange();
    scheduleRefresh();
  }

  scheduleRefresh();
  window.addEventListener("focus", refresh);
  window.addEventListener("pageshow", refresh);
  document.addEventListener("visibilitychange", refresh);

  return () => {
    window.clearTimeout(timeoutId);
    window.removeEventListener("focus", refresh);
    window.removeEventListener("pageshow", refresh);
    document.removeEventListener("visibilitychange", refresh);
  };
}

export function useLocalCalendarDate() {
  return useSyncExternalStore<string | null>(
    subscribe,
    getBrowserCalendarDate,
    getServerSnapshot,
  );
}
