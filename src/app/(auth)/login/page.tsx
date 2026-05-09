"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-navy-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">AU</span>
            </div>
            <span className="font-bold text-navy-700 text-xl">Yuki AI</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to continue your job search
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <form action={action} className="space-y-5">
            <Input
              name="email"
              type="email"
              label="Email address"
              placeholder="you@example.com.au"
              required
              autoComplete="email"
            />
            <div>
              <Input
                name="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <div className="mt-1.5 text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-teal-600 hover:text-teal-700"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

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
              Sign in
              <ArrowRight size={16} />
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-navy-700 font-medium hover:underline">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
