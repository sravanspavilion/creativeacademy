"use client";

import { useEffect, useMemo, useState } from "react";
import { mockAcademy } from "@academy/shared";
import type { AcademyInfo, DataSource } from "@academy/shared";
import { appConfig } from "@/config/app.config";

export interface AcademyDataState {
  academy: AcademyInfo;
  source: DataSource;
}

/**
 * Fetch the academy configuration from the NestJS API with a short timeout.
 * Returns null when the API is unreachable or malformed so the dashboard can
 * fall back to bundled mock data (e.g. standalone Vercel deploys).
 */
async function fetchAcademy(url: string, timeoutMs = 2500): Promise<AcademyInfo | null> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/academy`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as AcademyInfo;
    if (!Array.isArray(data?.schedule) || typeof data?.name !== "string") return null;
    return data;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

/** Loads academy data once. Prefers the live API, falls back to mock data. */
export function useAcademyData(): AcademyDataState {
  const [academy, setAcademy] = useState<AcademyInfo>(mockAcademy);
  const [source, setSource] = useState<DataSource>("mock");

  useEffect(() => {
    // When no remote API is configured, the initial (mock) state is used
    // as-is — no synchronous setState in the effect body.
    if (!appConfig.useRemoteData || !appConfig.apiUrl) return;

    let disposed = false;
    fetchAcademy(appConfig.apiUrl)
      .then((data) => {
        if (disposed || !data) return;
        setAcademy(data);
        setSource("api");
      })
      .catch(() => {
        /* keep mock data */
      });
    return () => {
      disposed = true;
    };
  }, []);

  return useMemo(() => ({ academy, source }), [academy, source]);
}