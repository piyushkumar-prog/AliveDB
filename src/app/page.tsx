"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { StatsStrip } from "@/components/dashboard/stats-strip";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Project, PingLog, DashboardStats } from "@/types";

export default function DashboardPage() {
  const [projects, setProjects] = useState<(Project & { logs: PingLog[] })[]>([]);
  const [recentLogs, setRecentLogs] = useState<(PingLog & { project: { name: string } })[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    active: 0,
    warning: 0,
    down: 0,
    paused: 0,
    uptimePercent: 100,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);

    try {
      const [projectsRes, statsRes, logsRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/stats"),
        fetch("/api/logs"),
      ]);

      const projectsJson = await projectsRes.json();
      const statsJson = await statsRes.json();
      const logsJson = await logsRes.json();

      const fetchedProjects = projectsJson.data ?? [];
      setProjects(fetchedProjects);
      setStats(statsJson.data ?? stats);
      setRecentLogs(logsJson.data ?? []);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchData(), 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <>
      <Sidebar />
      <main className="main-content">
        {/* Page header */}
        <div
          style={{
            padding: "24px 32px 20px",
            borderBottom: "1px solid #e5e7eb",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#0a0a0a",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Dashboard
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "#6b7280",
                margin: "3px 0 0",
              }}
            >
              Monitor your Supabase projects · auto-refreshes every 30s
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => fetchData(true)}
              disabled={refreshing}
              title="Refresh"
            >
              <RefreshCw size={13} style={{ animation: refreshing ? "spin 0.7s linear infinite" : "none" }} />
            </button>
            <Link href="/projects/new" className="btn btn-primary btn-sm">
              <Plus size={13} />
              Add Project
            </Link>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "28px 32px" }}>
          {/* Stats */}
          <StatsStrip stats={stats} loading={loading} />

          {/* Projects grid + Activity feed */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 340px",
              gap: "24px",
              alignItems: "start",
            }}
          >
            {/* Projects */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "14px",
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
                  Projects{" "}
                  {!loading && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "500",
                        color: "#9ca3af",
                        marginLeft: "4px",
                      }}
                    >
                      ({projects.length})
                    </span>
                  )}
                </h2>
              </div>

              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="card"
                      style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}
                    >
                      <div className="skeleton" style={{ height: "16px", width: "40%" }} />
                      <div className="skeleton" style={{ height: "12px", width: "60%" }} />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div className="skeleton" style={{ height: "36px" }} />
                        <div className="skeleton" style={{ height: "36px" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <EmptyState />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onUpdate={() => fetchData()}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Activity feed */}
            <div style={{ position: "sticky", top: "24px" }}>
              <ActivityFeed logs={recentLogs} loading={loading} />
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .main-content { margin-left: 0 !important; }
          .sidebar { display: none; }
        }
      `}</style>
    </>
  );
}
