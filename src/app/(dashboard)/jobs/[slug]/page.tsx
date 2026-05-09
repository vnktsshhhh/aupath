"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { formatSalary, timeAgo, KANBAN_COLUMNS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import {
  MapPin,
  Briefcase,
  Clock,
  Building2,
  Bookmark,
  Sparkles,
  FileText,
  Plus,
  CheckCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  location: string;
  state: string;
  workType: string;
  employmentType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  visaSponsorship: boolean;
  workRights: string[];
  industry: string | null;
  experienceLevel: string | null;
  isFeatured: boolean;
  postedAt: string;
  company: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    description: string | null;
    website: string | null;
    location: string | null;
    size: string | null;
    industry: string | null;
  };
}

export default function JobDetailPage() {
  const { slug } = useParams();
  const { toast } = useToast();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);
  const [match, setMatch] = useState<{
    score: number;
    strengths: string[];
    gaps: string[];
    recommendation: string;
  } | null>(null);
  const [coverLetterOpen, setCoverLetterOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [coverLetterLoading, setCoverLetterLoading] = useState(false);
  const [bulletsOpen, setBulletsOpen] = useState(false);
  const [bullets, setBullets] = useState<string[]>([]);
  const [bulletsLoading, setBulletsLoading] = useState(false);
  const [addToTrackerOpen, setAddToTrackerOpen] = useState(false);
  const [trackerStatus, setTrackerStatus] = useState("applied");
  const [addingToTracker, setAddingToTracker] = useState(false);

  useEffect(() => {
    fetch(`/api/jobs/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setJob(data.job);
        setSaved(data.isSaved);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleSave() {
    const res = await fetch("/api/jobs/save", {
      method: "POST",
      body: JSON.stringify({ jobId: job?.id }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if ("saved" in data) {
      setSaved(data.saved);
      toast(data.saved ? "Job saved!" : "Removed from saved");
    }
  }

  async function handleMatch() {
    setMatchLoading(true);
    try {
      const res = await fetch("/api/ai/match", {
        method: "POST",
        body: JSON.stringify({ jobId: job?.id }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMatch(data);
    } catch {
      toast("Failed to calculate match. Make sure your profile is complete.", "error");
    } finally {
      setMatchLoading(false);
    }
  }

  async function handleCoverLetter() {
    setCoverLetterOpen(true);
    if (coverLetter) return;
    setCoverLetterLoading(true);
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        body: JSON.stringify({ jobId: job?.id }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCoverLetter(data.coverLetter);
    } catch {
      toast("Failed to generate cover letter.", "error");
      setCoverLetterOpen(false);
    } finally {
      setCoverLetterLoading(false);
    }
  }

  async function handleBullets() {
    setBulletsOpen(true);
    if (bullets.length) return;
    setBulletsLoading(true);
    try {
      const res = await fetch("/api/ai/bullets", {
        method: "POST",
        body: JSON.stringify({ jobId: job?.id }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBullets(data.bullets);
    } catch {
      toast("Failed to generate bullets.", "error");
      setBulletsOpen(false);
    } finally {
      setBulletsLoading(false);
    }
  }

  async function handleAddToTracker() {
    setAddingToTracker(true);
    const formData = new FormData();
    formData.append("jobId", job!.id);
    formData.append("jobTitle", job!.title);
    formData.append("companyName", job!.company.name);
    formData.append("status", trackerStatus);

    const res = await fetch("/api/tracker/add", {
      method: "POST",
      body: JSON.stringify({
        jobId: job!.id,
        jobTitle: job!.title,
        companyName: job!.company.name,
        status: trackerStatus,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (data.success) {
      toast("Added to tracker!");
      setAddToTrackerOpen(false);
    } else {
      toast("Failed to add to tracker", "error");
    }
    setAddingToTracker(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-teal-600" size={32} />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Job not found.</p>
        <Link href="/jobs" className="text-teal-600 text-sm mt-2 inline-block">
          Browse all jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/jobs" className="text-sm text-gray-400 hover:text-gray-600">
          ← Back to jobs
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardBody>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {job.company.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={job.company.logoUrl} alt={job.company.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <Building2 size={28} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
                  <Link
                    href={`/companies/${job.company.slug}`}
                    className="text-teal-600 hover:underline text-sm font-medium"
                  >
                    {job.company.name}
                  </Link>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={12} /> {job.location}, {job.state}
                    </span>
                    <Badge variant={job.workType === "remote" ? "teal" : job.workType === "hybrid" ? "amber" : "navy"}>
                      {job.workType}
                    </Badge>
                    <Badge variant="outline">{job.employmentType}</Badge>
                    {job.visaSponsorship && <Badge variant="green">Visa sponsorship</Badge>}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-sm font-semibold text-navy-700">
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </span>
                    {job.experienceLevel && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Briefcase size={11} /> {job.experienceLevel}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={11} /> Posted {timeAgo(job.postedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-gray-100">
                <Button onClick={handleSave} variant={saved ? "secondary" : "outline"} size="sm">
                  <Bookmark size={14} className={saved ? "fill-current" : ""} />
                  {saved ? "Saved" : "Save"}
                </Button>
                <Button onClick={handleMatch} variant="outline" size="sm" loading={matchLoading}>
                  <Sparkles size={14} /> AI Match Score
                </Button>
                <Button onClick={handleCoverLetter} variant="outline" size="sm">
                  <FileText size={14} /> Cover Letter
                </Button>
                <Button onClick={handleBullets} variant="outline" size="sm">
                  <Sparkles size={14} /> Resume Bullets
                </Button>
                <Button onClick={() => setAddToTrackerOpen(true)} variant="secondary" size="sm">
                  <Plus size={14} /> Add to Tracker
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Match score */}
          {match && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">AI Match Analysis</h2>
                  <div className={`text-2xl font-bold ${match.score >= 80 ? "text-green-600" : match.score >= 60 ? "text-amber-600" : "text-gray-500"}`}>
                    {match.score}%
                  </div>
                </div>
                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${match.score >= 80 ? "bg-green-500" : match.score >= 60 ? "bg-amber-500" : "bg-gray-400"}`}
                    style={{ width: `${match.score}%` }}
                  />
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-green-700 mb-2">Strengths</h3>
                  <ul className="space-y-1">
                    {match.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                {match.gaps.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-amber-700 mb-2">Areas to address</h3>
                    <ul className="space-y-1">
                      {match.gaps.map((g, i) => (
                        <li key={i} className="text-sm text-gray-600 pl-4 border-l-2 border-amber-300">
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="bg-navy-50 rounded-lg px-4 py-3 text-sm text-navy-700">
                  <span className="font-semibold">Tip: </span>{match.recommendation}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Description */}
          <Card>
            <CardHeader><h2 className="font-semibold">About the role</h2></CardHeader>
            <CardBody>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{job.description}</p>
            </CardBody>
          </Card>

          {job.responsibilities.length > 0 && (
            <Card>
              <CardHeader><h2 className="font-semibold">Responsibilities</h2></CardHeader>
              <CardBody>
                <ul className="space-y-2">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-teal-500 mt-0.5">•</span> {r}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          {job.requirements.length > 0 && (
            <Card>
              <CardHeader><h2 className="font-semibold">Requirements</h2></CardHeader>
              <CardBody>
                <ul className="space-y-2">
                  {job.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle size={14} className="text-navy-500 shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((s) => (
                    <Badge key={s} variant="navy">{s}</Badge>
                  ))}
                </div>
              </div>
              {job.workRights.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Work rights</p>
                  <div className="space-y-1">
                    {job.workRights.map((r) => (
                      <p key={r} className="text-xs text-gray-600">{r}</p>
                    ))}
                  </div>
                </div>
              )}
              {job.industry && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Industry</p>
                  <p className="text-sm text-gray-700">{job.industry}</p>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company</p>
              <p className="font-semibold text-gray-900">{job.company.name}</p>
              {job.company.description && (
                <p className="text-xs text-gray-500 line-clamp-3">{job.company.description}</p>
              )}
              {job.company.location && (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin size={10} /> {job.company.location}
                </p>
              )}
              {job.company.size && (
                <p className="text-xs text-gray-400">{job.company.size}</p>
              )}
              <Link href={`/companies/${job.company.slug}`}>
                <Button variant="outline" size="sm" className="w-full mt-1">
                  View company <ExternalLink size={12} />
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Cover Letter Modal */}
      <Modal open={coverLetterOpen} onClose={() => setCoverLetterOpen(false)} title="Generated Cover Letter" size="lg">
        {coverLetterLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-teal-600" size={32} />
            <span className="ml-3 text-gray-500">Generating your cover letter…</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-700 whitespace-pre-line leading-relaxed min-h-[300px]">
              {coverLetter}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(coverLetter);
                toast("Copied to clipboard!");
              }}
            >
              Copy to clipboard
            </Button>
          </div>
        )}
      </Modal>

      {/* Bullets Modal */}
      <Modal open={bulletsOpen} onClose={() => setBulletsOpen(false)} title="Tailored Resume Bullets" size="md">
        {bulletsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-teal-600" size={32} />
            <span className="ml-3 text-gray-500">Generating bullets…</span>
          </div>
        ) : (
          <div className="space-y-3">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                <span className="text-teal-500 mt-0.5 shrink-0">•</span>
                <p className="text-sm text-gray-700">{b}</p>
              </div>
            ))}
            <p className="text-xs text-gray-400 pt-2">
              Copy these bullets to tailor your resume for this specific role.
            </p>
          </div>
        )}
      </Modal>

      {/* Add to Tracker Modal */}
      <Modal open={addToTrackerOpen} onClose={() => setAddToTrackerOpen(false)} title="Add to Job Tracker" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Track <strong>{job.title}</strong> at {job.company.name}
          </p>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
            <select
              value={trackerStatus}
              onChange={(e) => setTrackerStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {KANBAN_COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={() => setAddToTrackerOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddToTracker} loading={addingToTracker} className="flex-1">
              Add to tracker
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
