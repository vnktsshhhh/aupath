export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user: supaUser },
  } = await supabase.auth.getUser();

  const job = await prisma.job.findUnique({
    where: { slug },
    include: { company: true },
  });

  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let isSaved = false;
  if (supaUser) {
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: supaUser.id },
    });
    if (dbUser) {
      const saved = await prisma.savedJob.findUnique({
        where: { userId_jobId: { userId: dbUser.id, jobId: job.id } },
      });
      isSaved = !!saved;
    }
  }

  return NextResponse.json({ job, isSaved });
}
