import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const AUTH_ROUTES = ['/signin', '/signup', '/verify'];
const PROTECTED_ROUTES = ['/dashboard'];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Retrieve the JWT token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const isVarified = token?.id ? true : false;

    // Redirect authenticated users away from auth routes
    if (AUTH_ROUTES.some(route => pathname.startsWith(route)) && isVarified) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Redirect unauthenticated users away from protected routes
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route)) && !isVarified) {
        return NextResponse.redirect(new URL('/signin', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/signin',
        '/signup',
        '/verify',
        '/dashboard/:path*',
    ],
};
