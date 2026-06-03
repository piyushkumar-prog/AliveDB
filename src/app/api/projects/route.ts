import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { validateUrl } from "@/lib/ssrf-guard";
import { getNextPingTime } from "@/lib/scheduler";

const CreateProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  url: z.string().url("Must be a valid URL"),
  healthEndpoint: z.string().default("/"),
  pingInterval: z.enum(["6h", "12h", "24h", "custom"]).default("12h"),
  customCron: z.string().optional(),
  method: z.enum(["GET", "HEAD"]).default("GET"),
  supabaseAnonKey: z.string().optional(),
});

// GET /api/projects — List all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        logs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({ data: projects });
  } catch (error) {
    console.error("[GET /api/projects]", error);
    return NextResponse.json({ error: "Failed to fetch projects." }, { status: 500 });
  }
}

// POST /api/projects — Create a new project
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, url, healthEndpoint, pingInterval, customCron, method, supabaseAnonKey } = parsed.data;

    // SSRF validation
    try {
      await validateUrl(url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "URL is not allowed.";
      return NextResponse.json({ error: message }, { status: 422 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        url,
        healthEndpoint,
        pingInterval,
        customCron,
        method,
        supabaseAnonKey: supabaseAnonKey || null,
        status: "pending",
        nextPingAt: getNextPingTime(pingInterval),
      },
    });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/projects]", error);
    return NextResponse.json({ error: "Failed to create project." }, { status: 500 });
  }
}
