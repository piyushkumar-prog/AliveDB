import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/logs — Fetch recent ping logs globally across all projects
export async function GET() {
  try {
    const logs = await prisma.pingLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ data: logs });
  } catch (error) {
    console.error("[GET /api/logs]", error);
    return NextResponse.json({ error: "Failed to fetch logs." }, { status: 500 });
  }
}
