import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = token.role || "viewer"; 
    
    // In production, we avoid verbose logging of every request
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH_GATE] Path: ${path} | Role: ${role}`);
    }

    // 1. Protect Super Admin Routes
    if (path.startsWith("/admin")) {
      if (role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // 2. Protect Internal Firm Dashboard Routes
    const firmPaths = ["/dashboard", "/library", "/scenarios", "/matters", "/entities"];
    if (firmPaths.some(p => path.startsWith(p))) {
      if (role === "client") {
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
