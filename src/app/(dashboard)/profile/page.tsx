"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { UploadZone } from "@/components/resume/upload-zone";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import {
  AU_STATES,
  WORK_TYPES,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  WORK_RIGHTS,
} from "@/lib/utils";
import { Loader2, Save, User } from "lucide-react";

interface ProfileData {
  headline: string;
  summary: string;
  location: string;
  state: string;
  workRights: string;
  skills: string;
  yearsExperience: string;
  linkedinUrl: string;
  portfolioUrl: string;
  minSalaryAud: string;
  preferredJobTypes: string;
  preferredLocations: string;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState<ProfileData>({
    headline: "",
    summary: "",
    location: "",
    state: "",
    workRights: "",
    skills: "",
    yearsExperience: "",
    linkedinUrl: "",
    portfolioUrl: "",
    minSalaryAud: "",
    preferredJobTypes: "",
    preferredLocations: "",
  });

  const [resumes, setResumes] = useState<
    Array<{ id: string; fileName: string; createdAt: string; isActive: boolean }>
  >([]);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          const p = data.profile;
          setForm({
            headline: p.headline ?? "",
            summary: p.summary ?? "",
            location: p.location ?? "",
            state: p.state ?? "",
            workRights: p.workRights ?? "",
            skills: p.skills?.join(", ") ?? "",
            yearsExperience: p.yearsExperience?.toString() ?? "",
            linkedinUrl: p.linkedinUrl ?? "",
            portfolioUrl: p.portfolioUrl ?? "",
            minSalaryAud: p.minSalaryAud?.toString() ?? "",
            preferredJobTypes: p.preferredJobTypes?.join(", ") ?? "",
            preferredLocations: p.preferredLocations?.join(", ") ?? "",
          });
        }
        setResumes(data.resumes ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    const res = await fetch("/api/profile", { method: "POST", body: fd });
    const data = await res.json();
    if (data.success) {
      toast("Profile saved!");
    } else {
      toast(data.error ?? "Save failed", "error");
    }
    setSaving(false);
  }

  function field(key: keyof ProfileData) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm({ ...form, [key]: e.target.value }),
    };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-teal-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">
          Keep your profile complete for better AI job matches
        </p>
      </div>

      {/* Resume upload */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Resume</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload to auto-fill your profile with AI extraction
          </p>
        </CardHeader>
        <CardBody className="space-y-4">
          <UploadZone
            onSuccess={() => {
              // Reload profile after upload
              window.location.reload();
            }}
          />
          {resumes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">Uploaded resumes</p>
              {resumes.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                >
                  <span className="text-sm text-gray-700 truncate">{r.fileName}</span>
                  {r.isActive && (
                    <Badge variant="teal" className="ml-2 shrink-0">Active</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Profile form */}
      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <User size={16} />
              Professional Details
            </h2>
          </CardHeader>
          <CardBody className="space-y-5">
            <Input label="Professional headline" placeholder="e.g. Senior Software Engineer | 8 years experience" {...field("headline")} />
            <Textarea label="Professional summary" placeholder="A brief overview of your background and what you're looking for…" {...field("summary")} />

            <div className="grid grid-cols-2 gap-4">
              <Input label="City / suburb" placeholder="e.g. Sydney CBD" {...field("location")} />
              <Select
                label="State / territory"
                options={AU_STATES.map((s) => ({ value: s, label: s }))}
                placeholder="Select state"
                {...field("state")}
              />
            </div>

            <Select
              label="Work rights"
              options={WORK_RIGHTS.map((r) => ({ value: r, label: r }))}
              placeholder="Select work rights"
              {...field("workRights")}
            />

            <Input
              label="Skills (comma-separated)"
              placeholder="e.g. React, TypeScript, Python, AWS"
              {...field("skills")}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Years of experience"
                type="number"
                placeholder="5"
                {...field("yearsExperience")}
              />
              <Input
                label="Minimum salary (AUD / year)"
                type="number"
                placeholder="90000"
                {...field("minSalaryAud")}
              />
            </div>

            <Input
              label="LinkedIn URL"
              type="url"
              placeholder="https://linkedin.com/in/yourname"
              {...field("linkedinUrl")}
            />
            <Input
              label="Portfolio / website"
              type="url"
              placeholder="https://yoursite.com.au"
              {...field("portfolioUrl")}
            />

            <div className="pt-2 border-t border-gray-100 space-y-4">
              <p className="text-sm font-medium text-gray-700">Job preferences</p>
              <Input
                label="Preferred employment types (comma-separated)"
                placeholder="e.g. full-time, contract"
                {...field("preferredJobTypes")}
              />
              <Input
                label="Preferred locations (comma-separated)"
                placeholder="e.g. Sydney, Remote, Melbourne"
                {...field("preferredLocations")}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" loading={saving} size="md">
                <Save size={15} />
                Save profile
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </div>
  );
}
