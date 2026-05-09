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

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: supaUser.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await request.json();
  const { jobId, jobTitle, companyName, notes, status = "wishlist" } = body;

  if (!jobTitle) return NextResponse.json({ error: "jobTitle required" }, { status: 400 });

  const application = await prisma.jobApplication.create({
    data: {
      userId: dbUser.id,
      jobId: jobId || null,
      jobTitle,
      companyName,
      notes,
      status,
    },
  });

  return NextResponse.json({ success: true, application });
}
