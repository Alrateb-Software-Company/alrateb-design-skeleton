/**
 * Demo-only "auth": the login form stores the user in a cookie and the dashboard layout reads it.
 * Swap this file for your real auth (next-auth, etc.) — the UI only needs a { name, email, role }.
 */

export const SESSION_COOKIE = "demo_session";

export interface SessionUser {
  name: string;
  email: string;
  role: string;
}

export function parseSession(raw: string | undefined | null): SessionUser | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(decodeURIComponent(raw)) as Partial<SessionUser>;
    return typeof v.name === "string" && typeof v.email === "string" ? { name: v.name, email: v.email, role: v.role ?? "" } : null;
  } catch {
    return null;
  }
}

/** Client: start a demo session (30 days). */
export function signInDemo(user: SessionUser) {
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=2592000; samesite=lax`;
}

/** Client: end the demo session. */
export function signOutDemo() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
