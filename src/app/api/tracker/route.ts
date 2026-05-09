export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user: supaUser },
  } = await supabase.auth.getUser();
  if (!supaUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: supaUser.id } });
  if (!dbUser) return NextResponse.json({ applications: [] });

  const applications = await prisma.jobApplication.findMany({
    where: { userId: dbUser.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ applications });
}
