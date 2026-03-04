import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "SELLER" | "USER";
  balance: number;
  canteenId?: number | null;
}

/**
 * Get the current authenticated user from the session cookie.
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;

  try {
    const parsed = JSON.parse(sessionCookie.value) as {
      id: number;
      email: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: parsed.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balance: true,
        canteenId: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "ADMIN" | "SELLER" | "USER",
      balance: user.balance,
      canteenId: user.canteenId,
    };
  } catch {
    return null;
  }
}

export function encodeSession(user: Partial<SessionUser>): string {
  return JSON.stringify(user);
}
