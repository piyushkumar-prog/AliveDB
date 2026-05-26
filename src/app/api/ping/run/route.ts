import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { pingUrl } from "@/lib/ping-engine";
import { getNextPingTime } from "@/lib/scheduler";

// Simple in-memory rate limit: projectId → last manual ping timestamp
const manualPingCooldowns = new Map<string, number>();
const COOLDOWN_MS = 30_000; // 30 seconds between manual pings

const RunPingSchema = z.object({
  projectId: z.string().min(1),
});

// POST /api/ping/run — Manually trigger a ping for a project
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RunPingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "projectId is required." }, { status: 400 });
    }

    const { projectId } = parsed.data;

    // Rate limit check
    const lastPing = manualPingCooldowns.get(projectId);
    if (lastPing && Date.now() - lastPing < COOLDOWN_MS) {
      const waitSec = Math.ceil((COOLDOWN_MS - (Date.now() - lastPing)) / 1000);
      return NextResponse.json(
        { error: `Rate limited. Please wait ${waitSec}s before pinging again.` },
        { status: 429 }
      );
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    if (project.isPaused) {
      return NextResponse.json(
        { error: "Project is paused. Resume it before pinging." },
        { status: 409 }
      );
    }

    // Set cooldown before pinging (prevents spam even if ping is slow)
    manualPingCooldowns.set(projectId, Date.now());

    // Execute ping
    const result = await pingUrl(project.url, project.healthEndpoint, {
      method: project.method as "GET" | "HEAD",
    });

    const now = new Date();
    const nextPing = getNextPingTime(project.pingInterval, now);

    // Determine new status
    let status: string;
    if (result.success) {
      status = "active";
    } else if (result.error?.includes("Timeout")) {
      status = "warning";
    } else {
      status = "down";
    }

    // Update project and create log in a transaction
    const [log] = await prisma.$transaction([
      prisma.pingLog.create({
        data: {
          projectId,
          statusCode: result.statusCode ?? null,
          responseTime: result.responseTime ?? null,
          success: result.success,
          error: result.error ?? null,
        },
      }),
      prisma.project.update({
        where: { id: projectId },
        data: {
          status,
          lastPingedAt: now,
          nextPingAt: nextPing,
        },
      }),
    ]);

    return NextResponse.json({ data: { result, log } });
  } catch (error) {
    console.error("[POST /api/ping/run]", error);
    return NextResponse.json({ error: "Failed to execute ping." }, { status: 500 });
  }
}
