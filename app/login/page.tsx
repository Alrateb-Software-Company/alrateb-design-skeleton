import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { SESSION_COOKIE, parseSession } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (parseSession((await cookies()).get(SESSION_COOKIE)?.value)) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-app-bg to-app-bg p-4 dark:from-sky-950/20">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
