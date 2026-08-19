import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Optimistic (cookie-based) check only: is the user signed in at all.
// Role-specific authorization (instructor/admin) needs the DB `role` column,
// which lives outside the session cookie — Next's own guidance is to keep
// Proxy checks cookie-only and do DB-backed authorization in the route's
// layout/page instead (see lib/auth.ts `getCurrentAppUser`), since Proxy runs
// on every request including prefetches.
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  '/settings(.*)',
  '/learn(.*)',
  '/instructor(.*)',
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};