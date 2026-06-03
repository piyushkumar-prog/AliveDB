import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { pingUrl } from "@/lib/ping-engine";
import { isProjectDue, getNextPingTime } from "@/lib/scheduler";

// ============================================================
// AliveDB — Keepalive Endpoint
// A lightweight alternative to /api/cron/ping for external cron
// services (cron-job.org, UptimeRobot, GitHub Actions, etc.)
// Protected by the same CRON_SECRET authorization.
// ============================================================

// GET /api/keepalive — Trigger ping processing (for external cron services)
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    // Fetch all active (non-paused) projects
    const projects = await prisma.project.findMany({
      where: { isPaused: false },
    });

    // Filter to projects that are due
    const dueProjects = projects.filter(isProjectDue);

    if (dueProjects.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "No projects due for pinging.",
        checked: projects.length,
        pinged: 0,
        duration: Date.now() - startTime,
      });
    }

    // Ping all due projects concurrently
    const results = await Promise.allSettled(
      dueProjects.map(async (project) => {
        const result = await pingUrl(project.url, project.healthEndpoint, {
          method: project.method as "GET" | "HEAD",
          supabaseAnonKey: project.supabaseAnonKey,
        });

        const now = new Date();
        const nextPing = getNextPingTime(project.pingInterval, now);

        let status: string;
        if (result.success) {
          status = "active";
        } else if (result.error?.includes("Timeout")) {
          status = "warning";
        } else {
          status = "down";
        }

        await prisma.$transaction([
          prisma.pingLog.create({
            data: {
              projectId: project.id,
              statusCode: result.statusCode ?? null,
              responseTime: result.responseTime ?? null,
              success: result.success,
              error: result.error ?? null,
            },
          }),
          prisma.project.update({
            where: { id: project.id },
            data: { status, lastPingedAt: now, nextPingAt: nextPing },
          }),
        ]);

        return result;
      })
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      ok: true,
      message: `Processed ${dueProjects.length} project(s).`,
      checked: projects.length,
      pinged: dueProjects.length,
      succeeded,
      failed,
      duration: Date.now() - startTime,
    });
  } catch (error) {
    console.error("[GET /api/keepalive]", error);
    return NextResponse.json(
      { ok: false, error: "Keepalive job failed.", duration: Date.now() - startTime },
      { status: 500 }
    );
  }
}
