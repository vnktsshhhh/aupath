"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  AU_STATES,
  WORK_TYPES,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
} from "@/lib/utils";
import { Search, SlidersHorizontal, X } from "lucide-react";

const INDUSTRIES = [
  "Technology",
  "Finance & Banking",
  "Healthcare",
  "Mining & Resources",
  "Retail",
  "Education",
  "Government",
  "Construction",
  "Manufacturing",
  "Professional Services",
  "Hospitality",
  "Transport & Logistics",
];

export function JobFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const get = (key: string) => searchParams.get(key) ?? "";

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/jobs?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAll = () => router.push("/jobs");

  const hasFilters = Array.from(searchParams.keys()).some(
    (k) => k !== "page"
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search job title, skill, or keyword…"
          defaultValue={get("q")}
          onChange={(e) => update("q", e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Select
          options={AU_STATES.map((s) => ({ value: s, label: s }))}
          placeholder="All states"
          value={get("state")}
          onChange={(e) => update("state", e.target.value)}
        />
        <Select
          options={WORK_TYPES.map((w) => ({ value: w.value, label: w.label }))}
          placeholder="Work type"
          value={get("workType")}
          onChange={(e) => update("workType", e.target.value)}
        />
        <Select
          options={EMPLOYMENT_TYPES.map((e) => ({
            value: e.value,
            label: e.label,
          }))}
          placeholder="Employment"
          value={get("employmentType")}
          onChange={(e) => update("employmentType", e.target.value)}
        />
        <Select
          options={EXPERIENCE_LEVELS.map((l) => ({
            value: l.value,
            label: l.label,
          }))}
          placeholder="Experience"
          value={get("experienceLevel")}
          onChange={(e) => update("experienceLevel", e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy-700 transition-colors"
        >
          <SlidersHorizontal size={14} />
          {showAdvanced ? "Less filters" : "More filters"}
        </button>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
          >
            <X size={12} />
            Clear all
          </button>
        )}
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
          <Select
            options={INDUSTRIES.map((i) => ({ value: i, label: i }))}
            placeholder="Industry"
            value={get("industry")}
            onChange={(e) => update("industry", e.target.value)}
          />
          <div>
            <input
              type="number"
              placeholder="Min salary (AUD)"
              defaultValue={get("salaryMin")}
              onChange={(e) => update("salaryMin", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={get("visaSponsorship") === "true"}
              onChange={(e) =>
                update("visaSponsorship", e.target.checked ? "true" : "")
              }
              className="rounded accent-teal-600"
            />
            Visa sponsorship available
          </label>
        </div>
      )}
    </div>
  );
}
