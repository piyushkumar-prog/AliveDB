import { Activity, AlertTriangle, XCircle, PauseCircle, Server } from "lucide-react";
import type { DashboardStats } from "@/types";

interface StatsStripProps {
  stats: DashboardStats;
  loading?: boolean;
}

const STAT_CARDS = (stats: DashboardStats) => [
  {
    label: "Total Projects",
    value: stats.total,
    icon: Server,
    iconColor: "#6b7280",
    borderAccent: "#e5e7eb",
  },
  {
    label: "Active",
    value: stats.active,
    icon: Activity,
    iconColor: "#22c55e",
    borderAccent: "#22c55e",
  },
  {
    label: "Issues",
    value: stats.down + stats.warning,
    icon: stats.down > 0 ? XCircle : AlertTriangle,
    iconColor: stats.down > 0 ? "#ef4444" : stats.warning > 0 ? "#f59e0b" : "#6b7280",
    borderAccent: stats.down > 0 ? "#ef4444" : stats.warning > 0 ? "#f59e0b" : "#e5e7eb",
  },
  {
    label: "Uptime",
    value: `${stats.uptimePercent}%`,
    icon: Activity,
    iconColor: stats.uptimePercent >= 90 ? "#22c55e" : "#f59e0b",
    borderAccent: stats.uptimePercent >= 90 ? "#22c55e" : "#f59e0b",
  },
];

export function StatsStrip({ stats, loading }: StatsStripProps) {
  const cards = STAT_CARDS(stats);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "14px",
        marginBottom: "28px",
      }}
    >
      {cards.map((card) => (
        <div
          key={card.label}
          className="card"
          style={{
            padding: "18px 20px",
            borderTop: `2px solid ${card.borderAccent}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#9ca3af",
              }}
            >
              {card.label}
            </span>
            <card.icon size={15} color={card.iconColor} />
          </div>
          {loading ? (
            <div className="skeleton" style={{ height: "28px", width: "60px" }} />
          ) : (
            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#0a0a0a",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              {card.value}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
