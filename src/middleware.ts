import { NextRequest, NextResponse } from 'next/server';

const AUTH_ROUTES = ['/signin', '/signup', '/verify'];
const PROTECTED_ROUTES = ['/dashboard', '/dashboard/:path*'];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const isAuthenticated = Boolean(req.cookies.get('token')); // Adjust cookie name as needed

    // Prevent access to auth routes if already signed in
    if (AUTH_ROUTES.some(route => pathname.startsWith(route)) && isAuthenticated) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Prevent access to protected routes if not authenticated
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route)) && !isAuthenticated) {
        return NextResponse.redirect(new URL('/signin', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/signin', '/signup', '/verify', '/dashboard', '/dashboard/:path*'],
};