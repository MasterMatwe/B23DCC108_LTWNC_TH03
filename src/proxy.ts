import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { can } from "@/lib/permissions";

export default auth((request) => {
  if (!request.auth?.user) {
    const login = new URL("/login", request.nextUrl);
    login.searchParams.set(
      "callbackUrl",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(login);
  }

  const isAdminRoute =
    request.nextUrl.pathname === "/admin" ||
    request.nextUrl.pathname.startsWith("/admin/");
  if (isAdminRoute && !can(request.auth.user.role, "loan:review")) {
    return NextResponse.redirect(new URL("/forbidden", request.nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/loans/:path*", "/admin/:path*"],
};
