"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Zap, Pause, Play, Trash2, RefreshCw } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { StatusBadge } from "@/components/projects/status-badge";
import { UptimeChart } from "@/components/analytics/uptime-chart";
import { ResponseChart } from "@/components/analytics/response-chart";
import { formatRelativeTime } from "@/lib/scheduler";
import { formatDateTime, formatResponseTime, calculateUptimePercent } from "@/lib/utils";
import { format, subDays, startOfDay } from "date-fns";
import type { Project, PingLog } from "@/types";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [logs, setLogs] = useState<PingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinging, setPinging] = useState(false);

  const fetchProject = useCallback(async () => {
    const [projectsRes, logsRes] = await Promise.all([
      fetch("/api/projects"),
      fetch(`/api/logs/${id}?limit=100`),
    ]);

    const projectsJson = await projectsRes.json();
    const logsJson = await logsRes.json();

    const found = (projectsJson.data ?? []).find((p: Project) => p.id === id);
    if (!found) { router.push("/"); return; }

    setProject(found);
    setLogs(logsJson.data ?? []);
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handlePing = async () => {
    if (pinging || !project || project.isPaused) return;
    setPinging(true);
    await fetch("/api/ping/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: id }),
    });
    await fetchProject();
    setPinging(false);
  };

  const handleTogglePause = async () => {
    if (!project) return;
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPaused: !project.isPaused }),
    });
    await fetchProject();
  };

  const handleDelete = async () => {
    if (!project) return;
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    router.push("/");
  };

  // Build uptime chart data (last 7 days)
  const uptimeData = (() => {
    if (logs.length === 0) return [];
    return Array.from({ length: 7 }, (_, i) => {
      const day = startOfDay(subDays(new Date(), 6 - i));
      const nextDay = startOfDay(subDays(new Date(), 5 - i));
      const dayLogs = logs.filter((l) => {
        const d = new Date(l.createdAt);
        return d >= day && d < nextDay;
      });
      const total = dayLogs.length;
      const success = dayLogs.filter((l) => l.success).length;
      return {
        date: format(day, "MMM d"),
        uptime: total === 0 ? 100 : Math.round((success / total) * 100),
        total,
        success,
      };
    });
  })();

  // Build response chart data (last 20 pings)
  const responseData = logs.slice(0, 20).reverse().map((log, i) => ({
    label: `#${i + 1}`,
    responseTime: log.responseTime ?? 0,
    success: log.success,
  }));

  const overallUptime = calculateUptimePercent(logs);
  const avgResponseTime = logs.filter((l) => l.responseTime != null).reduce(
    (acc, l, _, arr) => acc + (l.responseTime ?? 0) / arr.length, 0
  );

  if (loading || !project) {
    return (
      <>
        <Sidebar />
        <main className="main-content">
          <div style={{ padding: "40px 32px" }}>
            <div className="skeleton" style={{ height: "24px", width: "200px", marginBottom: "24px" }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
              {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: "80px" }} />)}
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <main className="main-content">
        {/* Header */}
        <div className="page-header stack">
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "#6b7280",
              textDecoration: "none",
              marginBottom: "10px",
            }}
          >
            <ArrowLeft size={12} />
            Dashboard
          </Link>
          <div className="project-detail-header-row">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <h1 style={{ fontSize: "18px", fontWeight: "700", color: "#0a0a0a", margin: 0, letterSpacing: "-0.02em" }}>
                  {project.name}
                </h1>
                <StatusBadge status={project.isPaused ? "paused" : project.status} />
              </div>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6b7280", textDecoration: "none" }}
              >
                <ExternalLink size={11} />
                {project.url}{project.healthEndpoint !== "/" ? project.healthEndpoint : ""}
              </a>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-secondary btn-sm" onClick={handlePing} disabled={pinging || project.isPaused}>
                <Zap size={12} />
                {pinging ? "Pinging…" : "Ping Now"}
              </button>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={handleTogglePause} title={project.isPaused ? "Resume" : "Pause"}>
                {project.isPaused ? <Play size={13} /> : <Pause size={13} />}
              </button>
              <Link href={`/projects/${id}/edit`} className="btn btn-ghost btn-sm btn-icon" title="Edit">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </Link>
              <button className="btn btn-danger btn-sm btn-icon" onClick={handleDelete} title="Delete">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="page-content">
          {/* Summary stats */}
          <div className="stats-grid">
            {[
              { label: "Uptime", value: `${overallUptime}%` },
              { label: "Avg Response", value: avgResponseTime > 0 ? formatResponseTime(Math.round(avgResponseTime)) : "—" },
              { label: "Last Ping", value: formatRelativeTime(project.lastPingedAt) },
              { label: "Next Ping", value: project.isPaused ? "Paused" : formatRelativeTime(project.nextPingAt) },
            ].map((s) => (
              <div key={s.label} className="card" style={{ padding: "16px 20px" }}>
                <div style={{ fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: "6px" }}>
                  {s.label}
                </div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#0a0a0a", letterSpacing: "-0.02em" }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="charts-grid">
            <div className="card" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: "600", margin: "0 0 16px", color: "#0a0a0a" }}>
                7-Day Uptime
              </h3>
              <UptimeChart data={uptimeData} />
            </div>
            <div className="card" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: "600", margin: "0 0 16px", color: "#0a0a0a" }}>
                Response Times
              </h3>
              <ResponseChart data={responseData} />
            </div>
          </div>

          {/* Logs table */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "13px", fontWeight: "600", margin: 0, color: "#0a0a0a" }}>
                Ping History
              </h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={fetchProject} title="Refresh logs">
                <RefreshCw size={13} />
              </button>
            </div>
            {logs.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>
                No logs yet. Trigger a ping to get started.
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Status</th>
                      <th>HTTP Code</th>
                      <th>Response Time</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontSize: "12px", color: "#6b7280" }}>
                          {formatDateTime(log.createdAt)}
                        </td>
                        <td>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              fontSize: "12px",
                              fontWeight: "600",
                              color: log.success ? "#16a34a" : "#dc2626",
                            }}
                          >
                            <span className={`status-dot ${log.success ? "active" : "down"}`} />
                            {log.success ? "Success" : "Failed"}
                          </span>
                        </td>
                        <td>
                          {log.statusCode ? (
                            <span className="mono" style={{ color: log.statusCode < 400 ? "#16a34a" : "#dc2626" }}>
                              {log.statusCode}
                            </span>
                          ) : (
                            <span style={{ color: "#9ca3af" }}>—</span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", fontFamily: "monospace" }}>
                            {formatResponseTime(log.responseTime)}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", color: "#6b7280", maxWidth: "200px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {log.error ?? "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
