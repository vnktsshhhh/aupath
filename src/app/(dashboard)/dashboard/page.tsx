import { getUser } from "@/server/actions/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/jobs/job-card";
import Link from "next/link";
import { UploadZone } from "@/components/resume/upload-zone";
import {
  Sparkles,
  Briefcase,
  Bookmark,
  TrendingUp,
  ArrowRight,
  User,
} from "lucide-react";
import type { JobWithCompany } from "@/types";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) return null;

  const [savedCount, applicationCount, featuredJobs, recentApplications] =
    await Promise.all([
      prisma.savedJob.count({ where: { userId: user.id } }),
      prisma.jobApplication.count({ where: { userId: user.id } }),
      prisma.job.findMany({
        where: { isActive: true, isFeatured: true },
        take: 3,
        include: { company: true },
        orderBy: { postedAt: "desc" },
      }),
      prisma.jobApplication.findMany({
        where: { userId: user.id },
        take: 4,
        orderBy: { updatedAt: "desc" },
      }),
    ]);

  const hasProfile = !!user.profile;
  const hasResume =
    (await prisma.resume.count({ where: { userId: user.id, isActive: true } })) > 0;

  const stats = [
    { label: "Saved jobs", value: savedCount, icon: Bookmark, color: "text-amber-500" },
    { label: "Applications", value: applicationCount, icon: Briefcase, color: "text-teal-600" },
    {
      label: "Profile complete",
      value: hasProfile && hasResume ? "Yes" : "Incomplete",
      icon: User,
      color: "text-navy-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          G&apos;day, {user.name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s your job search overview for today.
        </p>
      </div>

      {/* Onboarding nudge */}
      {(!hasProfile || !hasResume) && (
        <div className="bg-gradient-to-r from-navy-700 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} />
                <h2 className="font-semibold">Complete your profile</h2>
              </div>
              <p className="text-navy-100 text-sm">
                Upload your resume to unlock AI job matching, cover letter generation,
                and personalised recommendations.
              </p>
            </div>
          </div>
          <div className="mt-5">
            <UploadZone />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardBody className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl bg-gray-50 ${s.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Featured jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Featured Jobs</h2>
          <Link
            href="/jobs"
            className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {featuredJobs.length === 0 ? (
          <Card>
            <CardBody className="text-center py-10 text-gray-400">
              No featured jobs right now. Check back soon.
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-3">
            {(featuredJobs as JobWithCompany[]).map((job) => (
              <JobCard key={job.id} job={job} compact />
            ))}
          </div>
        )}
      </div>

      {/* Recent applications */}
      {recentApplications.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Applications
            </h2>
            <Link
              href="/tracker"
              className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              View tracker <ArrowRight size={14} />
            </Link>
          </div>
          <Card>
            <div className="divide-y divide-gray-100">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {app.jobTitle}
                    </p>
                    {app.companyName && (
                      <p className="text-xs text-gray-500">{app.companyName}</p>
                    )}
                  </div>
                  <Badge
                    variant={
                      app.status === "offer"
                        ? "green"
                        : app.status === "rejected"
                        ? "red"
                        : app.status === "interview"
                        ? "amber"
                        : "default"
                    }
                  >
                    {app.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
