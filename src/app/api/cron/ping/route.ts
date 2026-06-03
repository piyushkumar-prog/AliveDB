import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { pingUrl } from "@/lib/ping-engine";
import { isProjectDue, getNextPingTime } from "@/lib/scheduler";

// GET /api/cron/ping — Called by Vercel Cron every hour
// Protected by CRON_SECRET environment variable
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
        message: "No projects due for pinging.",
        checked: projects.length,
        pinged: 0,
        duration: Date.now() - startTime,
      });
    }

    // Ping all due projects concurrently (with a concurrency limit)
    const results = await Promise.allSettled(
      dueProjects.map((project) => processPing(project))
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      message: `Processed ${dueProjects.length} project(s).`,
      checked: projects.length,
      pinged: dueProjects.length,
      succeeded,
      failed,
      duration: Date.now() - startTime,
    });
  } catch (error) {
    console.error("[GET /api/cron/ping]", error);
    return NextResponse.json(
      { error: "Cron job failed.", duration: Date.now() - startTime },
      { status: 500 }
    );
  }
}

async function processPing(project: {
  id: string;
  url: string;
  healthEndpoint: string;
  method: string;
  pingInterval: string;
  supabaseAnonKey: string | null;
}) {
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
      data: {
        status,
        lastPingedAt: now,
        nextPingAt: nextPing,
      },
    }),
  ]);

  return result;
}
