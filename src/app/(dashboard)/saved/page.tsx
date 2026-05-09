import { prisma } from "@/lib/prisma";
import { getUser } from "@/server/actions/auth";
import { JobCard } from "@/components/jobs/job-card";
import { Card, CardBody } from "@/components/ui/card";
import { Bookmark, Search } from "lucide-react";
import Link from "next/link";
import type { JobWithCompany } from "@/types";

export const metadata = { title: "Saved Jobs" };

export default async function SavedJobsPage() {
  const user = await getUser();
  if (!user) return null;

  const saved = await prisma.savedJob.findMany({
    where: { userId: user.id },
    include: { job: { include: { company: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
        <p className="text-gray-500 mt-1">
          {saved.length === 0
            ? "No saved jobs yet"
            : `${saved.length} saved ${saved.length === 1 ? "job" : "jobs"}`}
        </p>
      </div>

      {saved.length === 0 ? (
        <Card>
          <CardBody className="py-16 text-center">
            <Bookmark size={40} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No saved jobs yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-6">
              Bookmark jobs you&apos;re interested in while browsing
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-4 py-2 bg-navy-700 text-white text-sm font-medium rounded-lg hover:bg-navy-800 transition-colors"
            >
              <Search size={14} /> Browse jobs
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {saved.map((s) => (
            <JobCard
              key={s.id}
              job={s.job as JobWithCompany}
              isSaved
            />
          ))}
        </div>
      )}
    </div>
  );
}
