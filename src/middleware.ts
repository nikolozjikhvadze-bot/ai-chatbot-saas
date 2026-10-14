import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/projects(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const session = await auth();

  // თუ გვერდი დაცულია და მომხმარებელს არ აქვს userId (ანუ არ არის შემოსული)
  if (isProtectedRoute(req) && !session.userId) {
    // გადავამისამართოთ მთავარ გვერდზე ან სგნინზე
    const signInUrl = new URL('/', req.url);
    return NextResponse.redirect(signInUrl);
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