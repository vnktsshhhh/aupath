"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "./auth";
import { revalidatePath } from "next/cache";

export async function addApplication(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "Not authenticated" };

  const jobId = formData.get("jobId") as string | null;
  const jobTitle = formData.get("jobTitle") as string;
  const companyName = formData.get("companyName") as string;
  const notes = formData.get("notes") as string | null;

  if (!jobTitle) return { error: "Job title required" };

  await prisma.jobApplication.create({
    data: {
      userId: user.id,
      jobId: jobId || null,
      jobTitle,
      companyName,
      notes,
      status: "wishlist",
    },
  });

  revalidatePath("/tracker");
  return { success: true };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: string
) {
  const user = await getUser();
  if (!user) return { error: "Not authenticated" };

  await prisma.jobApplication.updateMany({
    where: { id: applicationId, userId: user.id },
    data: {
      status,
      appliedAt: status === "applied" ? new Date() : undefined,
    },
  });

  revalidatePath("/tracker");
  return { success: true };
}

export async function deleteApplication(applicationId: string) {
  const user = await getUser();
  if (!user) return { error: "Not authenticated" };

  await prisma.jobApplication.deleteMany({
    where: { id: applicationId, userId: user.id },
  });

  revalidatePath("/tracker");
  return { success: true };
}

export async function updateApplicationNotes(
  applicationId: string,
  notes: string,
  coverLetter?: string
) {
  const user = await getUser();
  if (!user) return { error: "Not authenticated" };

  await prisma.jobApplication.updateMany({
    where: { id: applicationId, userId: user.id },
    data: { notes, ...(coverLetter !== undefined && { coverLetter }) },
  });

  revalidatePath("/tracker");
  return { success: true };
}
