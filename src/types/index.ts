export type WorkType = "on-site" | "hybrid" | "remote";
export type EmploymentType = "full-time" | "part-time" | "contract" | "casual";
export type ExperienceLevel = "graduate" | "junior" | "mid" | "senior" | "lead";
export type ApplicationStatus =
  | "wishlist"
  | "applied"
  | "phone_screen"
  | "interview"
  | "offer"
  | "rejected";

export interface JobWithCompany {
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
  salaryCurrency: string;
  visaSponsorship: boolean;
  workRights: string[];
  industry: string | null;
  experienceLevel: string | null;
  isFeatured: boolean;
  postedAt: Date;
  company: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    industry: string | null;
    location: string | null;
    size: string | null;
  };
}

export interface ProfileWithRelations {
  id: string;
  userId: string;
  headline: string | null;
  summary: string | null;
  location: string | null;
  state: string | null;
  workRights: string | null;
  skills: string[];
  yearsExperience: number | null;
  preferredJobTypes: string[];
  preferredLocations: string[];
  minSalaryAud: number | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  experiences: Array<{
    id: string;
    title: string;
    company: string;
    location: string | null;
    startDate: Date;
    endDate: Date | null;
    isCurrent: boolean;
    description: string | null;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string | null;
    startYear: number;
    endYear: number | null;
  }>;
}

export interface JobFilters {
  q?: string;
  state?: string;
  workType?: string;
  employmentType?: string;
  experienceLevel?: string;
  industry?: string;
  salaryMin?: number;
  visaSponsorship?: boolean;
}
