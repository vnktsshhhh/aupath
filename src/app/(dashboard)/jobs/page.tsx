import { prisma } from "@/lib/prisma";
import { getUser } from "@/server/actions/auth";
import { JobCard } from "@/components/jobs/job-card";
import { JobFilters } from "@/components/jobs/job-filters";
import { Card, CardBody } from "@/components/ui/card";
import type { JobFilters as JobFiltersType, JobWithCompany } from "@/types";
import { Search } from "lucide-react";
import { Suspense } from "react";

export const metadata = { title: "Browse Jobs" };

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

async function JobList({
  filters,
  userId,
  savedJobIds,
}: {
  filters: JobFiltersType;
  userId: string;
  savedJobIds: Set<string>;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {
    isActive: true,
  };

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
      { skills: { has: filters.q } },
    ];
  }
  if (filters.state) where.state = filters.state;
  if (filters.workType) where.workType = filters.workType;
  if (filters.employmentType) where.employmentType = filters.employmentType;
  if (filters.experienceLevel) where.experienceLevel = filters.experienceLevel;
  if (filters.industry) where.industry = filters.industry;
  if (filters.salaryMin) where.salaryMin = { gte: filters.salaryMin };
  if (filters.visaSponsorship) where.visaSponsorship = true;

  const jobs = await prisma.job.findMany({
    where,
    include: { company: true },
    orderBy: [{ isFeatured: "desc" }, { postedAt: "desc" }],
    take: 30,
  });

  if (jobs.length === 0) {
    return (
      <Card>
        <CardBody className="py-16 text-center">
          <Search size={40} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No jobs match your filters</p>
          <p className="text-sm text-gray-400 mt-1">
            Try broadening your search or clearing some filters
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">{jobs.length} jobs found</p>
      {(jobs as JobWithCompany[]).map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isSaved={savedJobIds.has(job.id)}
        />
      ))}
    </div>
  );
}

export default async function JobsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const user = await getUser();

  const filters: JobFiltersType = {
    q: params.q,
    state: params.state,
    workType: params.workType,
    employmentType: params.employmentType,
    experienceLevel: params.experienceLevel,
    industry: params.industry,
    salaryMin: params.salaryMin ? Number(params.salaryMin) : undefined,
    visaSponsorship: params.visaSponsorship === "true",
  };

  const savedJobIds = new Set(
    user
      ? (
          await prisma.savedJob.findMany({
            where: { userId: user.id },
            select: { jobId: true },
          })
        ).map((s) => s.jobId)
      : []
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="text-gray-500 mt-1">
          Discover opportunities across Australia
        </p>
      </div>

      <JobFilters />

      <Suspense
        fallback={
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 bg-white rounded-xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        }
      >
        <JobList
          filters={filters}
          userId={user?.id ?? ""}
          savedJobIds={savedJobIds}
        />
      </Suspense>
    </div>
  );
}
