import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Redirect authenticated users away from public-only pages
  if (token && ["/signin", "/signup", "/verify"].includes(pathname)) {
    const userType = (token.variableUserType as string)?.toLowerCase() || "author";
    return NextResponse.redirect(new URL(`/dashboard/${userType}`, req.url));
  }

  // Redirect unauthenticated users trying to access protected routes
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // Redirect /dashboard to role-specific dashboard
  if (token && pathname === "/dashboard") {
    const userType = (token.variableUserType as string)?.toLowerCase() || "author";
    return NextResponse.redirect(new URL(`/dashboard/${userType}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/signin", "/signup", "/verify"],
};
