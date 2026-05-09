"use client";

import Link from "next/link";
import { JobWithCompany } from "@/types";
import { formatSalary, timeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { saveJob } from "@/server/actions/profile";
import { Bookmark, MapPin, Briefcase, Clock, Building2 } from "lucide-react";
import { useState } from "react";

interface JobCardProps {
  job: JobWithCompany;
  isSaved?: boolean;
  fitScore?: number;
  compact?: boolean;
}

const workTypeBadge: Record<string, "teal" | "amber" | "navy"> = {
  remote: "teal",
  hybrid: "amber",
  "on-site": "navy",
};

export function JobCard({ job, isSaved: initialSaved, fitScore, compact }: JobCardProps) {
  const [saved, setSaved] = useState(initialSaved ?? false);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await saveJob(job.id);
      if ("saved" in result) setSaved(result.saved ?? false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Link href={`/jobs/${job.slug}`} className="block group">
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-teal-400 hover:shadow-md transition-all duration-200 relative">
        {/* Featured badge */}
        {job.isFeatured && (
          <div className="absolute top-3 right-3">
            <Badge variant="amber">Featured</Badge>
          </div>
        )}

        {/* Fit score */}
        {fitScore !== undefined && (
          <div className="absolute top-3 right-3 flex items-center gap-1">
            <div
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                fitScore >= 80
                  ? "bg-green-100 text-green-700"
                  : fitScore >= 60
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {fitScore}% match
            </div>
          </div>
        )}

        <div className="flex items-start gap-4">
          {/* Company logo */}
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
            {job.company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={job.company.logoUrl}
                alt={job.company.name}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <Building2 size={24} className="text-gray-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-navy-700 transition-colors truncate pr-16">
              {job.title}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{job.company.name}</p>

            {!compact && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {job.description.slice(0, 150)}...
              </p>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={12} />
                {job.location}, {job.state}
              </span>
              <Badge variant={workTypeBadge[job.workType] ?? "default"}>
                {job.workType}
              </Badge>
              <Badge variant="outline">
                {job.employmentType}
              </Badge>
              {job.visaSponsorship && (
                <Badge variant="green">Visa sponsorship</Badge>
              )}
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-navy-700">
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </span>
                {job.experienceLevel && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Briefcase size={11} />
                    {job.experienceLevel}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={11} />
                  {timeAgo(job.postedAt)}
                </span>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-navy-600"
                  title={saved ? "Remove from saved" : "Save job"}
                >
                  <Bookmark
                    size={16}
                    className={saved ? "fill-navy-600 text-navy-600" : ""}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
