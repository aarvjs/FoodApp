import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookies = request.cookies;

  // Ignore static assets / sw.js
  if (pathname === "/sw.js" || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const hasAdminSession =
    cookies.get("admin_session")?.value === "true" ||
    cookies.get("admin_role")?.value === "admin";

  const managerRoleCookie = cookies.get("branch_manager_role")?.value || cookies.get("user_role")?.value;
  const hasManagerSession =
    cookies.get("branch_manager_session")?.value === "true" ||
    managerRoleCookie === "branchManager" ||
    managerRoleCookie === "branch_manager";

  // 1. Super Admin route protection
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const isAuthorizedAdmin = hasAdminSession || cookies.get("user_role")?.value === "admin";
    if (!isAuthorizedAdmin) {
      console.log("[Branch Audit] Current Route:", pathname, "| Redirect Reason: Missing admin session");
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Branch Manager route protection
  if (pathname.startsWith("/branch-manager") && !pathname.startsWith("/branch-manager/login")) {
    const isAuthorizedManager = hasManagerSession;
    if (!isAuthorizedManager) {
      console.log("[Branch Audit] Current Route:", pathname, "| Redirect Reason: Missing branch manager session");
      const loginUrl = new URL("/branch-manager/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Prevent authenticated users from visiting login pages
  if (pathname === "/admin/login" && hasAdminSession) {
    console.log("[Branch Audit] Current Route:", pathname, "| Redirect Reason: Authenticated Admin accessing login page");
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (pathname === "/branch-manager/login" && hasManagerSession) {
    console.log("[Branch Audit] Current Route:", pathname, "| Redirect Reason: Authenticated Branch Manager accessing login page");
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
