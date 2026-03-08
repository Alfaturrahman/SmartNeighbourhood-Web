import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login'];

// NOTE: Middleware is currently DISABLED because the app uses localStorage for auth,
// which is not accessible in server-side middleware.
// 
// To enable middleware:
// 1. Switch from localStorage to HTTP-only cookies for storing user/token
// 2. Set cookies on login: cookies().set('user', JSON.stringify(userData))
// 3. Uncomment the authentication check below
//
// For now, all routes are accessible (authentication is handled client-side in LayoutWrapper)

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all routes to pass through
  // Authentication is handled client-side in LayoutWrapper component
  return NextResponse.next();

  /* COMMENTED OUT - Enable when using cookies instead of localStorage
  
  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check if user data exists in cookies
  const userCookie = request.cookies.get('user');
  
  // If no user cookie and not on login/home page, redirect to login
  if (!userCookie && !publicRoutes.includes(pathname)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie.value);
      const allowedRoles = roleBasedRoutes[pathname];

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      console.error('Error parsing user cookie:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
  */
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (manifest.json, sw.js, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)',
  ],
};
