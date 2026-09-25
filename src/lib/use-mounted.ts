"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * True only after client-side hydration completes.
 *
 * This is the React-endorsed pattern (useSyncExternalStore with a server
 * snapshot) for rendering content client-only: during SSR and hydration the
 * server snapshot (false) is used so the HTML always matches, then the client
 * snapshot (true) kicks in after mount — no hydration mismatches and no
 * setState-in-effect lint violations.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}