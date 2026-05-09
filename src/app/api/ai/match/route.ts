export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { calculateJobMatch } from "@/lib/openrouter";

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
            include: { experiences: { take: 5, orderBy: { startDate: "desc" } } },
          },
        },
      }),
      prisma.job.findUnique({ where: { id: jobId } }),
    ]);

    if (!dbUser?.profile) {
      return NextResponse.json(
        { error: "Complete your profile first to get AI match scores." },
        { status: 400 }
      );
    }

    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const result = await calculateJobMatch(
      `${job.title}\n${job.description}\nRequired skills: ${job.skills.join(", ")}\nExperience: ${job.experienceLevel}`,
      {
        skills: dbUser.profile.skills,
        yearsExperience: dbUser.profile.yearsExperience,
        summary: dbUser.profile.summary,
        experiences: dbUser.profile.experiences.map((e) => ({
          title: e.title,
          company: e.company,
        })),
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Match error:", error);
    return NextResponse.json({ error: "Match calculation failed" }, { status: 500 });
  }
}
