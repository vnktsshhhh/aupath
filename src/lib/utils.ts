import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalary(min?: number | null, max?: number | null): string {
  if (!min && !max) return "Salary not specified";
  const fmt = (n: number) =>
    n >= 1000
      ? `$${Math.round(n / 1000)}k`
      : `$${n.toLocaleString()}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} AUD`;
  if (min) return `From ${fmt(min)} AUD`;
  return `Up to ${fmt(max!)} AUD`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function timeAgo(date: Date | string): string {
  const d = new Date(date);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

export const AU_STATES = [
  "NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT",
] as const;

export const WORK_TYPES = [
  { value: "on-site", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
] as const;

export const EMPLOYMENT_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "casual", label: "Casual" },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "graduate", label: "Graduate" },
  { value: "junior", label: "Junior (1-2 yrs)" },
  { value: "mid", label: "Mid-level (3-5 yrs)" },
  { value: "senior", label: "Senior (5+ yrs)" },
  { value: "lead", label: "Lead / Principal" },
] as const;

export const WORK_RIGHTS = [
  "Australian Citizen",
  "Permanent Resident",
  "Working Holiday Visa",
  "Student Visa (with work rights)",
  "Temporary Skilled Visa (482)",
  "Any right to work",
] as const;

export const KANBAN_COLUMNS = [
  { id: "wishlist", label: "Wishlist", color: "bg-gray-100" },
  { id: "applied", label: "Applied", color: "bg-blue-100" },
  { id: "phone_screen", label: "Phone Screen", color: "bg-purple-100" },
  { id: "interview", label: "Interview", color: "bg-amber-100" },
  { id: "offer", label: "Offer", color: "bg-green-100" },
  { id: "rejected", label: "Rejected", color: "bg-red-100" },
] as const;
