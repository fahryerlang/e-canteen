import { cookies } from "next/headers";

// Simple cookie-based session (no JWT library needed)
// In production, use a proper auth library like next-auth

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie) return null;

  try {
    const user = JSON.parse(sessionCookie.value) as SessionUser;
    return user;
  } catch {
    return null;
  }
}

export function encodeSession(user: SessionUser): string {
  return JSON.stringify(user);
}
