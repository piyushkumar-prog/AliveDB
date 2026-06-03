"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ExternalLink } from "lucide-react";
import { validateUrlSync } from "@/lib/ssrf-guard-client";

import type { Project } from "@/types";

interface ProjectFormProps {
  initialData?: Partial<Project>;
  mode: "create" | "edit";
}

const INTERVALS = [
  { value: "6h", label: "Every 6 hours" },
  { value: "12h", label: "Every 12 hours" },
  { value: "24h", label: "Every 24 hours" },
  { value: "custom", label: "Custom cron expression" },
];

const METHODS = [
  { value: "GET", label: "GET — Full request (recommended)" },
  { value: "HEAD", label: "HEAD — Headers only (lightweight)" },
];

export function ProjectForm({ initialData, mode }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    url: initialData?.url ?? "",
    healthEndpoint: initialData?.healthEndpoint ?? "/",
    pingInterval: initialData?.pingInterval ?? "12h",
    customCron: initialData?.customCron ?? "",
    method: initialData?.method ?? "GET",
    supabaseAnonKey: initialData?.supabaseAnonKey ?? "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) errors.name = "Project name is required.";
    if (!form.url.trim()) {
      errors.url = "URL is required.";
    } else {
      const check = validateUrlSync(form.url);
      if (!check.valid) errors.url = check.error ?? "Invalid URL.";
    }
    if (form.pingInterval === "custom" && !form.customCron.trim()) {
      errors.customCron = "Custom cron expression is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      url: form.url.trim(),
      healthEndpoint: form.healthEndpoint.trim() || "/",
      pingInterval: form.pingInterval,
      customCron: form.pingInterval === "custom" ? form.customCron.trim() : undefined,
      method: form.method,
      supabaseAnonKey: form.supabaseAnonKey.trim() || null,
    };

    try {
      const res = await fetch(
        mode === "create" ? "/api/projects" : `/api/projects/${initialData?.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Something went wrong.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const previewUrl = (() => {
    if (!form.url) return null;
    try {
      const base = new URL(form.url);
      const ep = form.healthEndpoint.startsWith("/") ? form.healthEndpoint : `/${form.healthEndpoint}`;
      return `${base.origin}${ep}`;
    } catch {
      return null;
    }
  })();

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Global error */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 14px",
            background: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            marginBottom: "24px",
            fontSize: "13px",
            color: "#dc2626",
          }}
        >
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Project Name
          </label>
          <input
            id="name"
            className="form-input"
            type="text"
            placeholder="My Supabase Project"
            value={form.name}
            onChange={set("name")}
            autoFocus
          />
          {fieldErrors.name && <p className="form-error">{fieldErrors.name}</p>}
        </div>

        {/* URL */}
        <div className="form-group">
          <label className="form-label" htmlFor="url">
            Project URL
          </label>
          <input
            id="url"
            className="form-input"
            type="url"
            placeholder="https://your-project.supabase.co"
            value={form.url}
            onChange={set("url")}
          />
          <p className="form-hint">The base URL of your Supabase project or any web service.</p>
          {fieldErrors.url && <p className="form-error">{fieldErrors.url}</p>}
        </div>

        {/* Health Endpoint */}
        <div className="form-group">
          <label className="form-label" htmlFor="healthEndpoint">
            Health Endpoint
          </label>
          <input
            id="healthEndpoint"
            className="form-input"
            type="text"
            placeholder="/api/health"
            value={form.healthEndpoint}
            onChange={set("healthEndpoint")}
          />
          <p className="form-hint">
            Path to ping. Use <code style={{ background: "#f3f4f6", padding: "1px 5px", borderRadius: "4px", fontSize: "11px" }}>/</code> to ping the homepage, or{" "}
            <code style={{ background: "#f3f4f6", padding: "1px 5px", borderRadius: "4px", fontSize: "11px" }}>/api/health</code> for a dedicated health endpoint.
          </p>

          {/* URL preview */}
          {previewUrl && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 10px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: "12px",
                color: "#6b7280",
              }}
            >
              <ExternalLink size={11} />
              <span style={{ fontFamily: "monospace" }}>{previewUrl}</span>
            </div>
          )}
        </div>

        {/* Supabase Anon Key */}
        <div className="form-group">
          <label className="form-label" htmlFor="supabaseAnonKey">
            Supabase Anon Key
            <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: "11px", marginLeft: "6px" }}>(recommended)</span>
          </label>
          <input
            id="supabaseAnonKey"
            className="form-input mono"
            type="password"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            value={form.supabaseAnonKey}
            onChange={set("supabaseAnonKey")}
            autoComplete="off"
          />
          <p className="form-hint">
            Your Supabase project&apos;s public{" "}
            <code style={{ background: "#f3f4f6", padding: "1px 5px", borderRadius: "4px", fontSize: "11px" }}>anon</code>{" "}
            key. Find it in{" "}
            <strong>Supabase Dashboard → Settings → API → Project API keys</strong>.{" "}
            Without this key, pings return 401 and{" "}
            <em>do not count as database activity</em> — your project may still get paused.
          </p>
        </div>

        {/* Ping Interval */}
        <div className="form-group">
          <label className="form-label" htmlFor="pingInterval">
            Ping Interval
          </label>
          <select
            id="pingInterval"
            className="form-select"
            value={form.pingInterval}
            onChange={set("pingInterval")}
          >
            {INTERVALS.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
          <p className="form-hint">
            How often to ping your project to prevent Supabase from pausing it.
          </p>
        </div>

        {/* Custom cron */}
        {form.pingInterval === "custom" && (
          <div className="form-group animate-fade-in">
            <label className="form-label" htmlFor="customCron">
              Custom Cron Expression
            </label>
            <input
              id="customCron"
              className="form-input mono"
              type="text"
              placeholder="0 */8 * * *"
              value={form.customCron}
              onChange={set("customCron")}
            />
            <p className="form-hint">
              Standard 5-field cron expression. Example:{" "}
              <code style={{ background: "#f3f4f6", padding: "1px 5px", borderRadius: "4px", fontSize: "11px" }}>
                0 */8 * * *
              </code>{" "}
              = every 8 hours.
            </p>
            {fieldErrors.customCron && <p className="form-error">{fieldErrors.customCron}</p>}
          </div>
        )}

        {/* HTTP Method */}
        <div className="form-group">
          <label className="form-label" htmlFor="method">
            HTTP Method
          </label>
          <select
            id="method"
            className="form-select"
            value={form.method}
            onChange={set("method")}
          >
            {METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            paddingTop: "8px",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    width: "12px",
                    height: "12px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                {mode === "create" ? "Adding…" : "Saving…"}
              </>
            ) : mode === "create" ? (
              "Add Project"
            ) : (
              "Save Changes"
            )}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => router.back()}
          >
            Cancel
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
}
