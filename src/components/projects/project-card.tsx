"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Play, Pause, Trash2, Zap, Clock, MoreVertical, ChevronRight } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { formatRelativeTime } from "@/lib/scheduler";
import { formatResponseTime } from "@/lib/utils";
import type { Project, PingLog } from "@/types";

interface ProjectCardProps {
  project: Project & { logs?: PingLog[] };
  onUpdate: () => void;
}

export function ProjectCard({ project, onUpdate }: ProjectCardProps) {
  const router = useRouter();
  const [pinging, setPinging] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [pingResult, setPingResult] = useState<{ success: boolean; message: string } | null>(null);

  const lastLog = project.logs?.[0];

  const handleManualPing = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pinging || project.isPaused) return;

    setPinging(true);
    setPingResult(null);

    try {
      const res = await fetch("/api/ping/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });

      const json = await res.json();

      if (res.ok) {
        setPingResult({ success: true, message: `${json.data.result.statusCode ?? "OK"} · ${formatResponseTime(json.data.result.responseTime)}` });
        onUpdate();
      } else {
        setPingResult({ success: false, message: json.error ?? "Ping failed" });
      }
    } catch {
      setPingResult({ success: false, message: "Network error" });
    } finally {
      setPinging(false);
      setTimeout(() => setPingResult(null), 4000);
    }
  };

  const handleTogglePause = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);

    await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPaused: !project.isPaused }),
    });

    onUpdate();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);

    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;

    setDeleting(true);
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    onUpdate();
    setDeleting(false);
  };

  const fullUrl = (() => {
    try {
      const base = new URL(project.url);
      return `${base.origin}${project.healthEndpoint}`;
    } catch {
      return project.url;
    }
  })();

  return (
    <div
      className="card animate-fade-in"
      style={{ padding: "20px", cursor: "pointer", position: "relative" }}
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "14px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "600", margin: 0, color: "#0a0a0a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {project.name}
            </h3>
            <ChevronRight size={13} color="#9ca3af" />
          </div>
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              fontSize: "12px",
              color: "#6b7280",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "240px",
            }}
          >
            <ExternalLink size={10} />
            {fullUrl}
          </a>
        </div>
        <StatusBadge status={project.isPaused ? "paused" : project.status} />
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: "3px" }}>
            Last Ping
          </div>
          <div style={{ fontSize: "13px", fontWeight: "500", color: "#0a0a0a" }}>
            {formatRelativeTime(project.lastPingedAt)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: "3px" }}>
            Next Ping
          </div>
          <div style={{ fontSize: "13px", fontWeight: "500", color: "#0a0a0a" }}>
            {project.isPaused ? "—" : formatRelativeTime(project.nextPingAt)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: "3px" }}>
            Interval
          </div>
          <div style={{ fontSize: "13px", fontWeight: "500", color: "#0a0a0a", display: "flex", alignItems: "center", gap: "4px" }}>
            <Clock size={11} color="#9ca3af" />
            {project.pingInterval === "custom" ? project.customCron ?? "Custom" : project.pingInterval}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: "3px" }}>
            Last Response
          </div>
          <div style={{ fontSize: "13px", fontWeight: "500", color: lastLog?.success ? "#16a34a" : lastLog ? "#ef4444" : "#9ca3af" }}>
            {lastLog ? (lastLog.statusCode ? `${lastLog.statusCode}` : lastLog.success ? "OK" : "Failed") : "—"}
            {lastLog?.responseTime ? ` · ${formatResponseTime(lastLog.responseTime)}` : ""}
          </div>
        </div>
      </div>

      {/* Ping result flash */}
      {pingResult && (
        <div
          style={{
            padding: "7px 10px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "500",
            marginBottom: "12px",
            background: pingResult.success ? "#dcfce7" : "#fee2e2",
            color: pingResult.success ? "#15803d" : "#dc2626",
            border: `1px solid ${pingResult.success ? "#bbf7d0" : "#fecaca"}`,
          }}
        >
          {pingResult.success ? "✓" : "✗"} {pingResult.message}
        </div>
      )}

      {/* Actions */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "6px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="btn btn-secondary btn-sm"
          onClick={handleManualPing}
          disabled={pinging || project.isPaused}
          title="Manual ping"
        >
          <Zap size={12} />
          {pinging ? "Pinging…" : "Ping Now"}
        </button>

        <button
          className="btn btn-ghost btn-sm btn-icon"
          onClick={handleTogglePause}
          title={project.isPaused ? "Resume monitoring" : "Pause monitoring"}
        >
          {project.isPaused ? <Play size={13} /> : <Pause size={13} />}
        </button>

        <button
          className="btn btn-ghost btn-sm btn-icon"
          onClick={() => { router.push(`/projects/${project.id}/edit`); }}
          title="Edit project"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>

        <button
          className="btn btn-danger btn-sm btn-icon"
          onClick={handleDelete}
          disabled={deleting}
          title="Delete project"
          style={{ marginLeft: "auto" }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
