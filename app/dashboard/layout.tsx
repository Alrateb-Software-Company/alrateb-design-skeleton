import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SessionProvider } from "@/components/layout/session-context";
import { SESSION_COOKIE, parseSession } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = parseSession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!user) redirect("/login");

  return (
    <SessionProvider user={user}>
      <DashboardShell>{children}</DashboardShell>
    </SessionProvider>
  );
}
