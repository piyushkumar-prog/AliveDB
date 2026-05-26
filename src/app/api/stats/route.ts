import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/stats — Dashboard aggregate statistics
export async function GET() {
  try {
    const [projects, recentLogs] = await Promise.all([
      prisma.project.findMany({
        select: { id: true, status: true, isPaused: true },
      }),
      prisma.pingLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 200, // Recent logs for uptime calculation
        select: { success: true },
      }),
    ]);

    const total = projects.length;
    const active = projects.filter((p) => p.status === "active").length;
    const warning = projects.filter((p) => p.status === "warning").length;
    const down = projects.filter((p) => p.status === "down").length;
    const paused = projects.filter((p) => p.isPaused).length;

    const uptimePercent =
      recentLogs.length === 0
        ? 100
        : Math.round((recentLogs.filter((l) => l.success).length / recentLogs.length) * 100);

    return NextResponse.json({
      data: { total, active, warning, down, paused, uptimePercent },
    });
  } catch (error) {
    console.error("[GET /api/stats]", error);
    return NextResponse.json({ error: "Failed to fetch stats." }, { status: 500 });
  }
}
