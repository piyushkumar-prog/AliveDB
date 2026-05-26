import { addHours, addMinutes } from "date-fns";

// ============================================================
// AliveDB — Scheduler
// Computes next ping times and checks if a project is due.
// ============================================================

const INTERVAL_HOURS: Record<string, number> = {
  "6h": 6,
  "12h": 12,
  "24h": 24,
};

export const INTERVAL_LABELS: Record<string, string> = {
  "6h": "Every 6 hours",
  "12h": "Every 12 hours",
  "24h": "Every 24 hours",
  custom: "Custom cron",
};

/**
 * Calculates the next ping time based on interval and last ping.
 */
export function getNextPingTime(
  interval: string,
  fromDate: Date = new Date()
): Date {
  const hours = INTERVAL_HOURS[interval];

  if (hours) {
    return addHours(fromDate, hours);
  }

  // Default fallback if unknown interval
  return addHours(fromDate, 12);
}

/**
 * Returns true if a project is due for a ping right now.
 */
export function isProjectDue(project: {
  isPaused: boolean;
  nextPingAt: Date | string | null;
  lastPingedAt: Date | string | null;
  pingInterval: string;
}): boolean {
  if (project.isPaused) return false;

  // Never been pinged — immediately due
  if (!project.lastPingedAt) return true;

  const now = new Date();
  const nextPing = project.nextPingAt ? new Date(project.nextPingAt) : null;

  if (!nextPing) return true;

  // Give a 5-minute tolerance window to prevent missed pings
  return nextPing <= addMinutes(now, 5);
}

/**
 * Human-readable relative time (e.g. "5 minutes ago", "in 2 hours")
 */
export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return "Never";

  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const absSec = Math.abs(diffSec);

  if (absSec < 60) return diffSec < 0 ? "Just now" : "In a moment";

  const absMin = Math.round(absSec / 60);
  if (absMin < 60) {
    return diffSec < 0 ? `${absMin}m ago` : `In ${absMin}m`;
  }

  const absHour = Math.round(absMin / 60);
  if (absHour < 24) {
    return diffSec < 0 ? `${absHour}h ago` : `In ${absHour}h`;
  }

  const absDay = Math.round(absHour / 24);
  return diffSec < 0 ? `${absDay}d ago` : `In ${absDay}d`;
}
