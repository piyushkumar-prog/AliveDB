import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { validateUrl } from "@/lib/ssrf-guard";
import { getNextPingTime } from "@/lib/scheduler";

const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  healthEndpoint: z.string().optional(),
  pingInterval: z.enum(["6h", "12h", "24h", "custom"]).optional(),
  customCron: z.string().optional(),
  method: z.enum(["GET", "HEAD"]).optional(),
  isPaused: z.boolean().optional(),
});

// PATCH /api/projects/:id — Update project
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = UpdateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const updates = parsed.data;

    // Validate new URL if provided
    if (updates.url) {
      try {
        await validateUrl(updates.url);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "URL is not allowed.";
        return NextResponse.json({ error: message }, { status: 422 });
      }
    }

    // Recalculate next ping if interval changed or project is being unpaused
    let nextPingAt: Date | undefined;
    if (updates.pingInterval || updates.isPaused === false) {
      const interval = updates.pingInterval ?? existing.pingInterval;
      nextPingAt = getNextPingTime(interval);
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...updates,
        ...(nextPingAt ? { nextPingAt } : {}),
        // Reset status when unpausing
        ...(updates.isPaused === false ? { status: "pending" } : {}),
        ...(updates.isPaused === true ? { status: "paused" } : {}),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PATCH /api/projects/:id]", error);
    return NextResponse.json({ error: "Failed to update project." }, { status: 500 });
  }
}

// DELETE /api/projects/:id — Delete project + cascade logs
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ message: "Project deleted successfully." });
  } catch (error) {
    console.error("[DELETE /api/projects/:id]", error);
    return NextResponse.json({ error: "Failed to delete project." }, { status: 500 });
  }
}
