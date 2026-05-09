export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: supaUser },
  } = await supabase.auth.getUser();
  if (!supaUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId } = await request.json();

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: supaUser.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const existing = await prisma.savedJob.findUnique({
    where: { userId_jobId: { userId: dbUser.id, jobId } },
  });

  if (existing) {
    await prisma.savedJob.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }

  await prisma.savedJob.create({ data: { userId: dbUser.id, jobId } });
  return NextResponse.json({ saved: true });
}
