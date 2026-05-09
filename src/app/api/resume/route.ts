export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { extractTextFromFile } from "@/lib/resume-parser";
import { extractProfileFromResume } from "@/lib/openrouter";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: supaUser },
    } = await supabase.auth.getUser();
    if (!supaUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: supaUser.id },
    });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const formData = await request.formData();
    const file = formData.get("resume") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text
    const extractedText = await extractTextFromFile(buffer, file.type);

    // Upload to Supabase Storage
    const fileName = `${dbUser.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    let fileUrl = "";
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(fileName);
      fileUrl = urlData.publicUrl;
    } else {
      // Fallback: store without file URL if bucket not configured
      fileUrl = `storage://${fileName}`;
    }

    // Deactivate old resumes
    await prisma.resume.updateMany({
      where: { userId: dbUser.id },
      data: { isActive: false },
    });

    // Extract profile with AI
    let parsedData = null;
    try {
      parsedData = await extractProfileFromResume(extractedText);
    } catch {
      // AI extraction failed — save resume but skip profile update
    }

    // Save resume record
    const resume = await prisma.resume.create({
      data: {
        userId: dbUser.id,
        fileName: file.name,
        fileUrl,
        fileType: file.type,
        extractedText,
        parsedData,
        isActive: true,
      },
    });

    // Update user profile from AI data
    if (parsedData) {
      const exp = (parsedData.experiences ?? []) as Array<{
        title: string;
        company: string;
        startDate?: string;
        endDate?: string | null;
        isCurrent?: boolean;
        description?: string;
      }>;
      const edu = (parsedData.education ?? []) as Array<{
        institution: string;
        degree: string;
        field?: string;
        startYear?: number;
        endYear?: number | null;
      }>;

      const profile = await prisma.profile.upsert({
        where: { userId: dbUser.id },
        update: {
          headline: parsedData.headline,
          summary: parsedData.summary,
          location: parsedData.location,
          state: parsedData.state,
          workRights: parsedData.workRights,
          skills: parsedData.skills ?? [],
          yearsExperience: parsedData.yearsExperience,
        },
        create: {
          userId: dbUser.id,
          headline: parsedData.headline,
          summary: parsedData.summary,
          location: parsedData.location,
          state: parsedData.state,
          workRights: parsedData.workRights,
          skills: parsedData.skills ?? [],
          yearsExperience: parsedData.yearsExperience,
        },
      });

      // Upsert experiences
      if (exp.length > 0) {
        await prisma.experience.deleteMany({ where: { profileId: profile.id } });
        await prisma.experience.createMany({
          data: exp.map((e) => ({
            profileId: profile.id,
            title: e.title,
            company: e.company,
            startDate: e.startDate ? new Date(e.startDate) : new Date(),
            endDate: e.endDate ? new Date(e.endDate) : null,
            isCurrent: e.isCurrent ?? false,
            description: e.description,
          })),
        });
      }

      if (edu.length > 0) {
        await prisma.education.deleteMany({ where: { profileId: profile.id } });
        await prisma.education.createMany({
          data: edu.map((e) => ({
            profileId: profile.id,
            institution: e.institution,
            degree: e.degree,
            field: e.field,
            startYear: e.startYear ?? 2000,
            endYear: e.endYear ?? null,
          })),
        });
      }

      // Update user name if extracted
      if (parsedData.name && !dbUser.name) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { name: parsedData.name },
        });
      }
    }

    return NextResponse.json({ resumeId: resume.id, parsedData });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
