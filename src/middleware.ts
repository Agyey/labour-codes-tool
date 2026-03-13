import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = token.role || "viewer"; // default fallback

    // 1. Protect Super Admin Routes
    if (path.startsWith("/admin")) {
      if (role !== "admin") {
        // Not an admin, redirect to normal dashboard
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // 2. Protect Internal Firm Dashboard Routes
    if (path.startsWith("/dashboard") || path.startsWith("/library") || path.startsWith("/scenarios") || path.startsWith("/matters")) {
      if (role === "client") {
        // Clients cannot see internal firm workspaces
        return NextResponse.redirect(new URL("/portal/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/library/:path*",
    "/scenarios/:path*",
    "/matters/:path*",
    "/entities/:path*",
    "/portal/:path*",
  ],
};
