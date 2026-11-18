import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, parseSession } from "@/lib/session";

export default async function Home() {
  redirect(parseSession((await cookies()).get(SESSION_COOKIE)?.value) ? "/dashboard" : "/login");
}
