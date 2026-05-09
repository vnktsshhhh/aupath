"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "./auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  headline: z.string().optional(),
  summary: z.string().optional(),
  location: z.string().optional(),
  state: z.string().optional(),
  workRights: z.string().optional(),
  skills: z.string().optional(),
  yearsExperience: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  minSalaryAud: z.string().optional(),
  preferredJobTypes: z.string().optional(),
  preferredLocations: z.string().optional(),
});

export async function updateProfile(_prev: unknown, formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid profile data" };

  const d = parsed.data;

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      headline: d.headline || null,
      summary: d.summary || null,
      location: d.location || null,
      state: d.state || null,
      workRights: d.workRights || null,
      skills: d.skills ? d.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      yearsExperience: d.yearsExperience ? parseInt(d.yearsExperience) : null,
      linkedinUrl: d.linkedinUrl || null,
      portfolioUrl: d.portfolioUrl || null,
      minSalaryAud: d.minSalaryAud ? parseInt(d.minSalaryAud) : null,
      preferredJobTypes: d.preferredJobTypes
        ? d.preferredJobTypes.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      preferredLocations: d.preferredLocations
        ? d.preferredLocations.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    },
    create: {
      userId: user.id,
      headline: d.headline || null,
      summary: d.summary || null,
      location: d.location || null,
      state: d.state || null,
      workRights: d.workRights || null,
      skills: d.skills ? d.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      yearsExperience: d.yearsExperience ? parseInt(d.yearsExperience) : null,
      linkedinUrl: d.linkedinUrl || null,
      portfolioUrl: d.portfolioUrl || null,
      minSalaryAud: d.minSalaryAud ? parseInt(d.minSalaryAud) : null,
      preferredJobTypes: d.preferredJobTypes
        ? d.preferredJobTypes.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      preferredLocations: d.preferredLocations
        ? d.preferredLocations.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function saveJob(jobId: string) {
  const user = await getUser();
  if (!user) return { error: "Not authenticated" };

  const existing = await prisma.savedJob.findUnique({
    where: { userId_jobId: { userId: user.id, jobId } },
  });

  if (existing) {
    await prisma.savedJob.delete({ where: { id: existing.id } });
    revalidatePath("/saved");
    revalidatePath("/jobs");
    return { saved: false };
  }

  await prisma.savedJob.create({ data: { userId: user.id, jobId } });
  revalidatePath("/saved");
  revalidatePath("/jobs");
  return { saved: true };
}
