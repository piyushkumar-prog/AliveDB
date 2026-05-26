import Link from "next/link";
import { Zap, Plus } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  showAddButton?: boolean;
}

export function EmptyState({
  title = "No projects yet",
  description = "Add your first Supabase project to start monitoring and prevent it from going inactive.",
  showAddButton = true,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 40px",
        textAlign: "center",
        border: "1px dashed #d1d5db",
        borderRadius: "12px",
        background: "#fafafa",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          background: "#f3f4f6",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
        }}
      >
        <Zap size={22} color="#22c55e" />
      </div>
      <h2
        style={{
          fontSize: "15px",
          fontWeight: "600",
          color: "#0a0a0a",
          marginBottom: "8px",
          margin: "0 0 8px 0",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: "13px",
          color: "#6b7280",
          maxWidth: "360px",
          lineHeight: "1.6",
          margin: "0 0 24px 0",
        }}
      >
        {description}
      </p>
      {showAddButton && (
        <Link href="/projects/new" className="btn btn-primary">
          <Plus size={14} />
          Add Project
        </Link>
      )}
    </div>
  );
}
