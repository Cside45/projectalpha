import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const headers = response.headers;

  // Basic security headers for web application protection
  headers.set('X-Frame-Options', 'DENY'); // Prevent clickjacking
  headers.set('X-Content-Type-Options', 'nosniff'); // Prevent MIME type sniffing
  
  // Content Security Policy - allow necessary resources for Google OAuth
  headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      // Allow inline styles and scripts (needed for Next.js)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://accounts.google.com",
      // Allow Google OAuth and API endpoints
      "connect-src 'self' https://accounts.google.com https://*.googleapis.com",
      "frame-src 'self' https://accounts.google.com",
      // Allow images from any HTTPS source (for user avatars)
      "img-src 'self' https: data:",
      "font-src 'self' https: data:",
    ].join('; ')
  );

  // Force HTTPS
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return response;
}

// Only apply to web pages, not API routes or static files
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 