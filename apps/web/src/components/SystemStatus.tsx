import { Wifi, WifiOff } from "lucide-react";
import type { DataSource } from "@academy/shared";

/**
 * Small status indicator: green pulse when data comes from the live API,
 * amber when the dashboard is running on bundled mock data.
 */
export function SystemStatus({ source }: { source: DataSource }) {
  const online = source === "api";

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm"
      role="status"
      title={online ? "Connected to the academy API" : "Running on local schedule data"}
    >
      <span
        className={`status-dot h-2 w-2 rounded-full ${online ? "bg-emerald-400" : "bg-amber-400"}`}
        aria-hidden
      />
      <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 sm:inline">
        {online ? "Live · API" : "Local · Mock"}
      </span>
      {online ? (
        <Wifi className="h-3.5 w-3.5 text-emerald-300/80" aria-hidden />
      ) : (
        <WifiOff className="h-3.5 w-3.5 text-amber-300/70" aria-hidden />
      )}
    </div>
  );
}