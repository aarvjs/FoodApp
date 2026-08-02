import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookies = request.cookies;

  // Ignore service worker or static Next.js assets
  if (pathname === "/sw.js" || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const hasAdminSession =
    cookies.get("admin_session")?.value === "true" ||
    cookies.get("admin_role")?.value === "admin";

  const hasManagerSession =
    cookies.get("branch_manager_session")?.value === "true" ||
    cookies.get("branch_manager_role")?.value === "branchManager";

  // 1. Super Admin route protection
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const isAuthorizedAdmin = hasAdminSession || cookies.get("user_role")?.value === "admin";
    if (!isAuthorizedAdmin) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Branch Manager route protection
  if (pathname.startsWith("/branch-manager") && !pathname.startsWith("/branch-manager/login")) {
    const isAuthorizedManager = hasManagerSession || cookies.get("user_role")?.value === "branchManager";
    if (!isAuthorizedManager) {
      const loginUrl = new URL("/branch-manager/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Prevent authenticated users from visiting login pages
  if (pathname === "/admin/login" && hasAdminSession) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (pathname === "/branch-manager/login" && hasManagerSession) {
    return NextResponse.redirect(new URL("/branch-manager/dashboard", request.url));
  }

  // 4. Handle root redirect
  if (pathname === "/") {
    if (hasAdminSession) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else if (hasManagerSession) {
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
