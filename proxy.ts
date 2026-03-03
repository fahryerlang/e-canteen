import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("session");

  // Public routes
  const publicRoutes = ["/", "/login", "/register"];
  const isPublicRoute = publicRoutes.includes(pathname);
  const isApiAuth = pathname.startsWith("/api/auth");
  const isApiPublic = pathname === "/api/menu" && request.method === "GET";

  // Allow public routes and auth API
  if (isPublicRoute || isApiAuth || isApiPublic) {
    // Redirect logged-in users away from login/register
    if (session && (pathname === "/login" || pathname === "/register")) {
      try {
        const user = JSON.parse(session.value);
        if (user.role === "ADMIN") {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }
        return NextResponse.redirect(new URL("/user/menu", request.url));
      } catch {
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Protected routes require session
  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based access control
  try {
    const user = JSON.parse(session.value);

    // Admin routes
    if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/user/menu", request.url));
    }

    // User routes
    if (pathname.startsWith("/user") && user.role !== "USER") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
