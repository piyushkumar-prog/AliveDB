import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/logs/:projectId — Fetch ping logs for a project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "100", 10), 500);
    const page = Math.max(parseInt(url.searchParams.get("page") ?? "1", 10), 1);

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const [logs, total] = await Promise.all([
      prisma.pingLog.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.pingLog.count({ where: { projectId } }),
    ]);

    return NextResponse.json({
      data: logs,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[GET /api/logs/:projectId]", error);
    return NextResponse.json({ error: "Failed to fetch logs." }, { status: 500 });
  }
}
