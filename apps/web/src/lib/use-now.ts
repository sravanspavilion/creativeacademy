"use client";

import { useEffect, useState } from "react";

/**
 * Ticking clock hook.
 *
 * - Ticks are aligned to the requested interval boundary (default 1 s),
 *   so the displayed second never "skips" due to drift.
 * - Every tick stores a fresh `new Date()` — never a decremented counter —
 *   so the time stays correct even after browser throttling.
 * - Re-syncs instantly when the tab becomes visible or regains focus.
 */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;

    const tick = () => {
      const delay = intervalMs - (Date.now() % intervalMs);
      timer = setTimeout(() => {
        if (disposed) return;
        setNow(new Date());
        tick();
      }, delay);
    };

    const onVisible = () => {
      if (disposed) return;
      if (typeof document !== "undefined" && !document.hidden) setNow(new Date());
    };

    const onFocus = () => {
      if (!disposed) setNow(new Date());
    };

    tick();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);

    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [intervalMs]);

  return now;
}