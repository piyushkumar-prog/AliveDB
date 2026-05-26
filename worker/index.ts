#!/usr/bin/env node
// ============================================================
// AliveDB — Standalone Worker (Docker / VPS)
// Uses node-cron to fire every hour and process due pings.
// For Vercel deployments, use Vercel Cron Jobs instead.
// ============================================================

import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

function createPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "";
  if (url.startsWith("libsql://") || url.startsWith("wss://")) {
    const libsql = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adapter = new PrismaLibSQL(libsql as any);
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();

}

const prisma = createPrisma();
const TIMEOUT_MS = parseInt(process.env.PING_TIMEOUT_MS ?? "10000", 10);
const MAX_RETRIES = parseInt(process.env.PING_MAX_RETRIES ?? "2", 10);

function addMinutes(date: Date, mins: number): Date {
  return new Date(date.getTime() + mins * 60_000);
}
function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 3_600_000);
}
function isProjectDue(project: { isPaused: boolean; nextPingAt: Date | null; lastPingedAt: Date | null }): boolean {
  if (project.isPaused) return false;
  if (!project.lastPingedAt) return true;
  const now = new Date();
  const nextPing = project.nextPingAt ?? null;
  if (!nextPing) return true;
  return nextPing <= addMinutes(now, 5);
}
function getNextPingTime(interval: string, from: Date = new Date()): Date {
  const map: Record<string, number> = { "6h": 6, "12h": 12, "24h": 24 };
  return addHours(from, map[interval] ?? 12);
}

async function pingUrl(url: string, endpoint: string, method: string): Promise<{ success: boolean; statusCode?: number; responseTime?: number; error?: string }> {
  const fullUrl = (() => {
    try {
      const base = new URL(url);
      const ep = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
      return `${base.origin}${ep}`;
    } catch {
      return url;
    }
  })();

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const start = Date.now();
    try {
      const res = await fetch(fullUrl, {
        method,
        signal: controller.signal,
        headers: { "User-Agent": "AliveDB-Worker/1.0" },
      });
      clearTimeout(timer);
      const responseTime = Date.now() - start;
      const success = res.status < 500;
      return { success, statusCode: res.status, responseTime };
    } catch (err: unknown) {
      clearTimeout(timer);
      const responseTime = Date.now() - start;
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      const msg = err instanceof Error && err.name === "AbortError"
        ? `Timeout after ${TIMEOUT_MS}ms`
        : err instanceof Error ? err.message : "Unknown error";
      return { success: false, responseTime, error: msg };
    }
  }
  return { success: false, error: "Max retries exceeded" };
}

async function processProjects() {
  const projects = await prisma.project.findMany({ where: { isPaused: false } });
  const due = projects.filter(isProjectDue);

  if (due.length === 0) {
    console.log(`[${new Date().toISOString()}] No projects due for pinging.`);
    return;
  }

  console.log(`[${new Date().toISOString()}] Pinging ${due.length} project(s)...`);

  await Promise.allSettled(
    due.map(async (project) => {
      const result = await pingUrl(project.url, project.healthEndpoint, project.method);
      const now = new Date();
      const status = result.success ? "active" : result.error?.includes("Timeout") ? "warning" : "down";
      await prisma.$transaction([
        prisma.pingLog.create({
          data: { projectId: project.id, statusCode: result.statusCode ?? null, responseTime: result.responseTime ?? null, success: result.success, error: result.error ?? null },
        }),
        prisma.project.update({
          where: { id: project.id },
          data: { status, lastPingedAt: now, nextPingAt: getNextPingTime(project.pingInterval, now) },
        }),
      ]);
      console.log(`  [${project.name}] ${result.success ? "✓" : "✗"} ${result.statusCode ?? result.error} (${result.responseTime}ms)`);
    })
  );
}

// Run once on start
processProjects();

// Schedule: every hour
cron.schedule("0 * * * *", () => {
  processProjects().catch(console.error);
});

console.log("AliveDB Worker started. Checking projects every hour.");

// Graceful shutdown
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
