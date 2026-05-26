

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Plus, LayoutDashboard, Github, Menu, X, LogOut } from "lucide-react";
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
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="mobile-header">
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          <img
            src="/logo.png"
            alt="AliveDB Logo"
            style={{
              width: "100px",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </Link>
        <button
          className="mobile-menu-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Drawer Overlay for Mobile */}
      <div
        className={cn("sidebar-backdrop", isOpen && "open")}
        onClick={() => setIsOpen(false)}
      />

      <aside className={cn("sidebar", isOpen && "open")}>
        {/* Close button inside sidebar on mobile */}
        <div className="sidebar-mobile-close-container">
          <button
            className="mobile-menu-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close Menu"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "24px 16px 16px", display: "flex", justifyContent: "center" }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
            }}
          >
            <img
              src="/logo.png"
              alt="AliveDB Logo"
              style={{
                width: "140px",
                height: "auto",
                objectFit: "contain",
              }}
            />
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
              href="https://github.com/piyushkumar-prog/AliveDB"
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
          <button
            onClick={handleLogout}
            className="sidebar-logout-btn"
            id="sidebar-logout-btn"
            title="Sign out"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

