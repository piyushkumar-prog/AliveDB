import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatTime, formatDate } from "@/lib/utils";
import type { PingLog, Project } from "@/types";

interface ActivityFeedProps {
  logs: (PingLog & { project?: Pick<Project, "name"> })[];
  loading?: boolean;
}

export function ActivityFeed({ logs, loading }: ActivityFeedProps) {
  return (
    <div
      className="card"
      style={{ overflow: "hidden" }}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "#0a0a0a",
            margin: 0,
          }}
        >
          Recent Activity
        </h2>
        <span
          style={{
            fontSize: "11px",
            color: "#9ca3af",
            fontWeight: "500",
          }}
        >
          Last 20 pings
        </span>
      </div>

      {loading ? (
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div className="skeleton" style={{ width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0 }} />
              <div className="skeleton" style={{ height: "14px", flex: 1 }} />
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "13px",
          }}
        >
          No ping activity yet.
        </div>
      ) : (
        <div style={{ maxHeight: "360px", overflowY: "auto" }}>
          {logs.map((log) => {
            const isToday = new Date(log.createdAt).toDateString() === new Date().toDateString();
            return (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 20px",
                  borderBottom: "1px solid #f3f4f6",
                  transition: "background 0.1s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                {/* Status icon */}
                <div style={{ flexShrink: 0 }}>
                  {log.success ? (
                    <CheckCircle2 size={14} color="#22c55e" />
                  ) : log.error?.includes("Timeout") ? (
                    <Clock size={14} color="#f59e0b" />
                  ) : (
                    <XCircle size={14} color="#ef4444" />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "1px",
                    }}
                  >
                    {log.project && (
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#0a0a0a",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {log.project.name}
                      </span>
                    )}
                    {log.statusCode && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontFamily: "monospace",
                          color: log.success ? "#16a34a" : "#dc2626",
                          background: log.success ? "#dcfce7" : "#fee2e2",
                          padding: "1px 5px",
                          borderRadius: "4px",
                        }}
                      >
                        {log.statusCode}
                      </span>
                    )}
                    {log.error && !log.statusCode && (
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#dc2626",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "160px",
                        }}
                      >
                        {log.error}
                      </span>
                    )}
                  </div>
                  {log.responseTime != null && (
                    <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                      {log.responseTime}ms
                    </span>
                  )}
                </div>

                {/* Time */}
                <div
                  style={{
                    fontSize: "11px",
                    color: "#9ca3af",
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {isToday ? formatTime(log.createdAt) : formatDate(log.createdAt)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
