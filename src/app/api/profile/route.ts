export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user: supaUser },
  } = await supabase.auth.getUser();
  if (!supaUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: supaUser.id },
    include: {
      profile: {
        include: {
          experiences: { orderBy: { startDate: "desc" } },
          education: { orderBy: { startYear: "desc" } },
        },
      },
      resumes: { where: { isActive: true }, orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  return NextResponse.json({
    profile: dbUser?.profile ?? null,
    resumes: dbUser?.resumes ?? [],
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: supaUser },
  } = await supabase.auth.getUser();
  if (!supaUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: supaUser.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const formData = await request.formData();
  const get = (key: string) => (formData.get(key) as string) || null;
  const getArr = (key: string) =>
    (formData.get(key) as string)
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  await prisma.profile.upsert({
    where: { userId: dbUser.id },
    update: {
      headline: get("headline"),
      summary: get("summary"),
      location: get("location"),
      state: get("state"),
      workRights: get("workRights"),
      skills: getArr("skills"),
      yearsExperience: get("yearsExperience") ? parseInt(get("yearsExperience")!) : null,
      linkedinUrl: get("linkedinUrl"),
      portfolioUrl: get("portfolioUrl"),
      minSalaryAud: get("minSalaryAud") ? parseInt(get("minSalaryAud")!) : null,
      preferredJobTypes: getArr("preferredJobTypes"),
      preferredLocations: getArr("preferredLocations"),
    },
    create: {
      userId: dbUser.id,
      headline: get("headline"),
      summary: get("summary"),
      location: get("location"),
      state: get("state"),
      workRights: get("workRights"),
      skills: getArr("skills"),
      yearsExperience: get("yearsExperience") ? parseInt(get("yearsExperience")!) : null,
      linkedinUrl: get("linkedinUrl"),
      portfolioUrl: get("portfolioUrl"),
      minSalaryAud: get("minSalaryAud") ? parseInt(get("minSalaryAud")!) : null,
      preferredJobTypes: getArr("preferredJobTypes"),
      preferredLocations: getArr("preferredLocations"),
    },
  });

  return NextResponse.json({ success: true });
}
