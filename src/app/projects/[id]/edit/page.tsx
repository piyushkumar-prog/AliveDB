"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { ProjectForm } from "@/components/projects/project-form";
import type { Project } from "@/types";

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/projects`)
      .then((r) => r.json())
      .then((json) => {
        const found = (json.data ?? []).find((p: Project) => p.id === id);
        if (!found) {
          setNotFound(true);
        } else {
          setProject(found);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <Sidebar />
      <main className="main-content">
        <div
          style={{
            padding: "24px 32px 20px",
            borderBottom: "1px solid #e5e7eb",
            background: "#ffffff",
          }}
        >
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
            Back to Dashboard
          </Link>
          <h1
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#0a0a0a",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Edit Project
          </h1>
        </div>

        <div style={{ padding: "28px 32px", maxWidth: "560px" }}>
          {loading ? (
            <div className="card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton" style={{ height: "40px" }} />
              ))}
            </div>
          ) : notFound ? (
            <div className="card" style={{ padding: "28px", textAlign: "center" }}>
              <p style={{ color: "#ef4444", fontSize: "14px", marginBottom: "16px" }}>
                Project not found.
              </p>
              <Link href="/" className="btn btn-secondary btn-sm">
                Back to Dashboard
              </Link>
            </div>
          ) : (
            <div className="card" style={{ padding: "28px" }}>
              <ProjectForm mode="edit" initialData={project!} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
