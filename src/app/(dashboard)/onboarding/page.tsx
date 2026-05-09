"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { UploadZone } from "@/components/resume/upload-zone";
import { AU_STATES, WORK_RIGHTS } from "@/lib/utils";
import { ArrowRight, CheckCircle, User, FileText } from "lucide-react";

const steps = [
  { id: 1, title: "Upload Resume", icon: FileText },
  { id: 2, title: "Basic Info", icon: User },
  { id: 3, title: "Ready!", icon: CheckCircle },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [uploadDone, setUploadDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    location: "",
    state: "",
    workRights: "",
    skills: "",
    yearsExperience: "",
    minSalaryAud: "",
  });

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm({ ...form, [key]: e.target.value }),
    };
  }

  async function handleBasicInfo() {
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    await fetch("/api/profile", { method: "POST", body: fd });
    setSaving(false);
    setStep(3);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <div key={s.id} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      done
                        ? "bg-teal-500 text-white"
                        : active
                        ? "bg-navy-700 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {done ? <CheckCircle size={18} /> : <Icon size={18} />}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      active ? "text-navy-700" : "text-gray-400"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mb-4 ${
                      done ? "bg-teal-400" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {/* Step 1: Resume upload */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Upload your resume
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Our AI will extract your profile automatically
                </p>
              </div>
              <UploadZone onSuccess={() => setUploadDone(true)} />
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  Skip for now
                </Button>
                {uploadDone && (
                  <Button size="sm" onClick={() => setStep(2)} className="flex-1">
                    Continue <ArrowRight size={14} />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Basic info */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Tell us about yourself
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  This helps us find the right jobs for you
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" placeholder="Sydney" {...field("location")} />
                <Select
                  label="State"
                  options={AU_STATES.map((s) => ({ value: s, label: s }))}
                  placeholder="Select"
                  {...field("state")}
                />
              </div>
              <Select
                label="Work rights"
                options={WORK_RIGHTS.map((r) => ({ value: r, label: r }))}
                placeholder="Select your work rights"
                {...field("workRights")}
              />
              <Input
                label="Key skills (comma-separated)"
                placeholder="React, TypeScript, Python…"
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
                  label="Min. salary (AUD)"
                  type="number"
                  placeholder="90000"
                  {...field("minSalaryAud")}
                />
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={handleBasicInfo}
                loading={saving}
              >
                Finish setup <ArrowRight size={16} />
              </Button>
            </div>
          )}

          {/* Step 3: Done */}
          {step === 3 && (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-teal-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  You&apos;re all set!
                </h2>
                <p className="text-gray-500 text-sm mt-2">
                  Start browsing jobs tailored to your profile
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => router.push("/jobs")}
                >
                  Browse jobs <ArrowRight size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
