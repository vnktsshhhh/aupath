import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { JobCard } from "@/components/jobs/job-card";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Globe, Users } from "lucide-react";
import type { JobWithCompany } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const company = await prisma.company.findUnique({ where: { slug } });
  return { title: company?.name ?? "Company" };
}

export default async function CompanyPage({ params }: PageProps) {
  const { slug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      jobs: {
        where: { isActive: true },
        include: { company: true },
        orderBy: [{ isFeatured: "desc" }, { postedAt: "desc" }],
      },
    },
  });

  if (!company) notFound();

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="text-sm text-gray-400">
        <a href="/companies" className="hover:text-gray-600">
          ← Companies
        </a>
      </div>

      {/* Company header */}
      <Card>
        <CardBody>
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
              {company.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <Building2 size={36} className="text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
              {company.industry && (
                <p className="text-teal-600 font-medium text-sm mt-0.5">
                  {company.industry}
                </p>
              )}
              <div className="flex flex-wrap gap-4 mt-3">
                {company.location && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin size={14} /> {company.location}
                    {company.state && `, ${company.state}`}
                  </span>
                )}
                {company.size && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Users size={14} /> {company.size}
                  </span>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-teal-600 hover:underline"
                  >
                    <Globe size={14} /> Website
                  </a>
                )}
              </div>
              {company.description && (
                <p className="text-gray-600 text-sm mt-4 leading-relaxed">
                  {company.description}
                </p>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Jobs */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Open Positions</h2>
          <Badge variant={company.jobs.length > 0 ? "teal" : "default"}>
            {company.jobs.length}
          </Badge>
        </div>

        {company.jobs.length === 0 ? (
          <Card>
            <CardBody className="text-center py-10 text-gray-400">
              No open positions at the moment. Check back soon.
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-3">
            {(company.jobs as JobWithCompany[]).map((job) => (
              <JobCard key={job.id} job={job} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
