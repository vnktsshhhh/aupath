export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { generateResumeBullets } from "@/lib/openrouter";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: supaUser },
    } = await supabase.auth.getUser();
    if (!supaUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { jobId } = await request.json();
    if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

    const [dbUser, job] = await Promise.all([
      prisma.user.findUnique({
        where: { supabaseId: supaUser.id },
        include: {
          profile: {
            include: { experiences: { take: 3, orderBy: { startDate: "desc" } } },
          },
        },
      }),
      prisma.job.findUnique({ where: { id: jobId } }),
    ]);

    if (!dbUser?.profile) {
      return NextResponse.json(
        { error: "Please complete your profile first." },
        { status: 400 }
      );
    }

    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const existingBullets = dbUser.profile.experiences
      .map((e) => `${e.title} at ${e.company}: ${e.description ?? ""}`)
      .join("\n");

    const bullets = await generateResumeBullets({
      jobTitle: job.title,
      jobDescription: job.description,
      existingBullets,
    });

    return NextResponse.json({ bullets });
  } catch (error) {
    console.error("Bullets error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
