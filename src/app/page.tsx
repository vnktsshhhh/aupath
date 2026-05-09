import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  FileText,
  Kanban,
  Building2,
  CheckCircle,
  ArrowRight,
  MapPin,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Job Matching",
    desc: "Get an explainable fit score for every job based on your skills and experience.",
  },
  {
    icon: FileText,
    title: "Smart Resume Parser",
    desc: "Upload your PDF or DOCX resume — AI extracts your profile in seconds.",
  },
  {
    icon: FileText,
    title: "Cover Letter AI",
    desc: "Generate tailored, professional cover letters in Australian English instantly.",
  },
  {
    icon: Kanban,
    title: "Job Tracker Kanban",
    desc: "Manage your applications from wishlist to offer in one visual board.",
  },
  {
    icon: Building2,
    title: "Company Profiles",
    desc: "Research employers with industry insights and current openings.",
  },
  {
    icon: MapPin,
    title: "AU-First",
    desc: "AUD salaries, visa sponsorship flags, work rights, and state-level search.",
  },
];

const stats = [
  { value: "100+", label: "Active jobs" },
  { value: "20+", label: "Companies" },
  { value: "AI", label: "Powered matching" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-navy-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">AU</span>
            </div>
            <span className="font-bold text-navy-700 text-lg">AuPath</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-navy-700 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-700 text-white text-sm font-medium rounded-lg hover:bg-navy-800 transition-colors"
            >
              Get started free
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-navy-700 via-navy-800 to-navy-900 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-teal-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-amber-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-400/30 rounded-full px-4 py-1.5 text-sm text-teal-200 mb-6">
            <Sparkles size={14} />
            AI-powered · Built for Australia
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            Your path to{" "}
            <span className="text-teal-400">Australian</span> opportunity
          </h1>
          <p className="text-lg md:text-xl text-navy-200 max-w-2xl mx-auto mb-10">
            Upload your resume, discover matched jobs, generate tailored cover
            letters, and track every application — all powered by AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-colors shadow-lg"
            >
              Start for free
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors border border-white/20"
            >
              Browse jobs
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-14 pt-10 border-t border-white/10">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-navy-300 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy-700">
              Everything you need to land your next role
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              AuPath combines smart AI tools with Australian market knowledge to
              give you a real edge.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="p-6 rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-navy-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-50 transition-colors">
                    <Icon size={20} className="text-navy-700 group-hover:text-teal-600 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-navy-700 text-center mb-14">
            Three steps to your next opportunity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Upload your resume", desc: "PDF or DOCX — our AI extracts your skills and experience automatically." },
              { step: "2", title: "Discover matched jobs", desc: "Browse 100+ real Australian roles with AI fit scores and salary in AUD." },
              { step: "3", title: "Apply with confidence", desc: "Generate tailored cover letters and track every application to offer." },
            ].map((s) => (
              <div key={s.step} className="relative text-center">
                <div className="w-12 h-12 rounded-full bg-navy-700 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-navy-700 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to find your path?</h2>
        <p className="text-navy-200 mb-8 max-w-md mx-auto">
          Join thousands of candidates who&apos;ve discovered smarter ways to
          job search in Australia.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-colors"
        >
          Create free account
          <ArrowRight size={16} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-navy-900 text-center text-navy-400 text-sm">
        <p>© 2025 AuPath · For demonstration purposes only · Not affiliated with any employer</p>
      </footer>
    </div>
  );
}
