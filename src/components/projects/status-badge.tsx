import { cn } from "@/lib/utils";

type StatusType = "active" | "warning" | "down" | "pending" | "paused";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<StatusType, { label: string; badgeClass: string }> = {
  active: { label: "Active", badgeClass: "badge-active" },
  warning: { label: "Warning", badgeClass: "badge-warning" },
  down: { label: "Down", badgeClass: "badge-down" },
  pending: { label: "Pending", badgeClass: "badge-pending" },
  paused: { label: "Paused", badgeClass: "badge-paused" },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const key = (status || "pending") as StatusType;
  const config = STATUS_CONFIG[key] ?? STATUS_CONFIG.pending;

  return (
    <span className={cn("badge", config.badgeClass, size === "sm" && "text-xs")}>
      <span className={cn("status-dot", key)} />
      {config.label}
    </span>
  );
}
