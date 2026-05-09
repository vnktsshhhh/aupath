export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { parse } from "csv-parse/sync";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: supaUser },
    } = await supabase.auth.getUser();
    if (!supaUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: supaUser.id } });
    if (!dbUser?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("csv") as File | null;
    if (!file) return NextResponse.json({ error: "No CSV file" }, { status: 400 });

    const text = await file.text();
    const records = parse(text, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[];

    let created = 0;
    let skipped = 0;

    for (const row of records) {
      try {
        const companyName = row.company?.trim();
        if (!companyName || !row.title) { skipped++; continue; }

        // Upsert company
        const companySlug = slugify(companyName);
        const company = await prisma.company.upsert({
          where: { slug: companySlug },
          update: {},
          create: {
            name: companyName,
            slug: companySlug,
            industry: row.industry || null,
            location: row.location || null,
            state: row.state || null,
          },
        });

        // Build unique slug
        let jobSlug = slugify(`${row.title}-${companyName}-${row.location ?? ""}`);
        const existing = await prisma.job.findFirst({ where: { slug: jobSlug } });
        if (existing) jobSlug = `${jobSlug}-${Date.now()}`;

        await prisma.job.create({
          data: {
            title: row.title.trim(),
            companyId: company.id,
            description: row.description || `${row.title} position at ${companyName}.`,
            requirements: row.requirements ? row.requirements.split("|").map((s) => s.trim()) : [],
            responsibilities: row.responsibilities ? row.responsibilities.split("|").map((s) => s.trim()) : [],
            skills: row.skills ? row.skills.split(",").map((s) => s.trim()) : [],
            location: row.location || "Sydney",
            state: row.state || "NSW",
            workType: row.workType || "on-site",
            employmentType: row.employmentType || "full-time",
            salaryMin: row.salaryMin ? parseInt(row.salaryMin) : null,
            salaryMax: row.salaryMax ? parseInt(row.salaryMax) : null,
            visaSponsorship: row.visaSponsorship === "true",
            workRights: row.workRights ? row.workRights.split(",").map((s) => s.trim()) : ["Any right to work"],
            industry: row.industry || null,
            experienceLevel: row.experienceLevel || null,
            isFeatured: row.isFeatured === "true",
            slug: jobSlug,
          },
        });
        created++;
      } catch (err) {
        console.error("Row error:", err);
        skipped++;
      }
    }

    return NextResponse.json({ created, skipped, total: records.length });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
