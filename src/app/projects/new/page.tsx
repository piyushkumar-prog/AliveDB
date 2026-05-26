import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { ProjectForm } from "@/components/projects/project-form";

export const metadata: Metadata = {
  title: "Add Project",
};

export default function NewProjectPage() {
  return (
    <>
      <Sidebar />
      <main className="main-content">
        {/* Page header */}
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
            Add Project
          </h1>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "3px 0 0" }}>
            Configure a Supabase project to keep alive.
          </p>
        </div>

        {/* Form */}
        <div className="page-content" style={{ maxWidth: "560px" }}>
          <div className="card" style={{ padding: "28px" }}>
            <ProjectForm mode="create" />
          </div>
        </div>
      </main>
    </>
  );
}
