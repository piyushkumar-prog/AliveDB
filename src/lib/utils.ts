import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return "—";
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
}

export function formatTime(date: Date | string | null): string {
  if (!date) return "—";
  return format(new Date(date), "h:mm a");
}

export function formatResponseTime(ms: number | null | undefined): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function calculateUptimePercent(logs: { success: boolean }[]): number {
  if (logs.length === 0) return 100;
  const successful = logs.filter((l) => l.success).length;
  return Math.round((successful / logs.length) * 100);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "text-green-600";
    case "warning":
      return "text-amber-500";
    case "down":
      return "text-red-500";
    case "paused":
      return "text-gray-400";
    default:
      return "text-gray-400";
  }
}
