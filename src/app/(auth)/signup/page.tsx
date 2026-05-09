"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signUp, null);

  if (state && "success" in state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
            <CheckCircle size={48} className="text-teal-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h2>
            <p className="text-gray-500">{state.success}</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 mt-6 text-sm text-navy-700 font-medium hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-navy-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">AU</span>
            </div>
            <span className="font-bold text-navy-700 text-xl">AuPath</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Start finding your next Australian opportunity
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <form action={action} className="space-y-5">
            <Input
              name="name"
              label="Full name"
              placeholder="Alex Smith"
              required
              autoComplete="name"
            />
            <Input
              name="email"
              type="email"
              label="Email address"
              placeholder="you@example.com.au"
              required
              autoComplete="email"
            />
            <Input
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              hint="At least 8 characters"
            />

            {state && "error" in state && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
                {state.error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={pending}
            >
              Create account
              <ArrowRight size={16} />
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-navy-700 font-medium hover:underline">
            Sign in
          </Link>
        </p>

        <p className="text-center text-xs text-gray-400 mt-4">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
