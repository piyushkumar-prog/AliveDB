"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Plus, LayoutDashboard, Github, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Add Project",
    href: "/projects/new",
    icon: Plus,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px" }}>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              background: "#0a0a0a",
              borderRadius: "7px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Zap size={15} color="#22c55e" strokeWidth={2.5} />
          </div>
          <div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#0a0a0a",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              AliveDB
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#9ca3af",
                fontWeight: "500",
                marginTop: "2px",
              }}
            >
              Keep-Alive Monitor
            </div>
          </div>
        </Link>
      </div>

      <hr className="divider" />

      {/* Navigation */}
      <nav style={{ padding: "12px 12px", flex: 1 }}>
        <div
          style={{
            fontSize: "10px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#9ca3af",
            padding: "0 8px",
            marginBottom: "6px",
          }}
        >
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                padding: "8px 10px",
                borderRadius: "7px",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: isActive ? "600" : "500",
                color: isActive ? "#0a0a0a" : "#6b7280",
                background: isActive ? "#f3f4f6" : "transparent",
                transition: "all 0.15s ease",
                marginBottom: "2px",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "#f9fafb";
                  e.currentTarget.style.color = "#0a0a0a";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#6b7280";
                }
              }}
            >
              <item.icon size={15} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "12px 16px 20px" }}>
        <hr className="divider" style={{ marginBottom: "14px" }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Activity size={13} color="#22c55e" />
            <span style={{ fontSize: "11px", fontWeight: "600", color: "#22c55e" }}>
              v0.1.0
            </span>
          </div>
          <a
            href="https://github.com/yourusername/alivedb"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm btn-icon"
            title="View on GitHub"
          >
            <Github size={14} />
          </a>
        </div>
        <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "6px" }}>
          Open source · MIT License
        </div>
      </div>
    </aside>
  );
}
