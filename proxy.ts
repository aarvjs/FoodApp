import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userRole = request.cookies.get("user_role")?.value;

  // 1. Super Admin route protection
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!userRole || userRole !== "admin") {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Branch Manager route protection
  if (pathname.startsWith("/branch-manager") && !pathname.startsWith("/branch-manager/login")) {
    if (!userRole || userRole !== "branchManager") {
      const loginUrl = new URL("/branch-manager/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Prevent authenticated users from visiting login pages
  if (pathname === "/admin/login" && userRole === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (pathname === "/branch-manager/login" && userRole === "branchManager") {
    return NextResponse.redirect(new URL("/branch-manager/dashboard", request.url));
  }

  // 4. Handle root redirect
  if (pathname === "/") {
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else if (userRole === "branchManager") {
      return NextResponse.redirect(new URL("/branch-manager/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/branch-manager/:path*"
  ]
};
