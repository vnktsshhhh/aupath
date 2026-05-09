export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { generateCoverLetter } from "@/lib/openrouter";

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
      prisma.job.findUnique({ where: { id: jobId }, include: { company: true } }),
    ]);

    if (!dbUser?.profile) {
      return NextResponse.json(
        { error: "Please complete your profile before generating a cover letter." },
        { status: 400 }
      );
    }

    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const coverLetter = await generateCoverLetter({
      jobTitle: job.title,
      companyName: job.company.name,
      jobDescription: job.description,
      candidateName: dbUser.name ?? "Candidate",
      candidateSummary: dbUser.profile.summary ?? "",
      candidateSkills: dbUser.profile.skills,
      experiences: dbUser.profile.experiences.map((e) => ({
        title: e.title,
        company: e.company,
      })),
    });

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error("Cover letter error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
