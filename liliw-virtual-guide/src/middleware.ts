import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

const ADMIN_ROLES  = ['admin'];
const STAFF_ROLES  = ['admin', 'chatoofficer', 'chatoeditor'];

function getSessionRole(req: NextRequest): string | null {
  const session = verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  return session?.role ?? null;
}

function hasAuthHeader(req: NextRequest): boolean {
  const auth = req.headers.get('Authorization');
  return !!(auth && auth.startsWith('Bearer ') && auth.length > 10);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Protect /api/admin/* routes ──
  // These must always carry a Bearer token — block requests without one.
  // Exception: external-reviews with a strapiId param is public (cached Google data for attraction pages).
  if (pathname.startsWith('/api/admin/')) {
    const isPublicExternalReview =
      pathname === '/api/admin/external-reviews' &&
      req.nextUrl.searchParams.has('strapiId');
    if (!isPublicExternalReview && !hasAuthHeader(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // ── Protect /admin page ──
  if (pathname.startsWith('/admin')) {
    const role = getSessionRole(req);
    if (!role || !STAFF_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // ── Protect /cms page ──
  if (pathname.startsWith('/cms')) {
    const role = getSessionRole(req);
    if (!role || !STAFF_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // ── Protect /lbo page ──
  if (pathname.startsWith('/lbo')) {
    const role = getSessionRole(req);
    if (!role) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // ── Keep an administrator in the admin surfaces ──
  // Everything past this point is the visitor-facing site, which is public —
  // a signed-out stranger reads all of it, so this guards nothing. It keeps
  // the admin account pointed at the work it exists for: the dashboard, and
  // the 360° tour, whose editor lives on the public page rather than in the
  // panel. The staff routes above have already returned, so they are
  // unaffected.
  if (!pathname.startsWith('/immersive')) {
    const role = getSessionRole(req);
    if (role && ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  runtime: 'nodejs',
  matcher: [
    '/api/admin/:path*',
    /*
     * Every page route, so the rule above can see the visitor-facing site —
     * but nothing that isn't a page. Redirecting a stylesheet, an icon or the
     * service worker would break the admin panel it redirects to, so anything
     * under api or _next, and any path with a file extension, is excluded.
     */
    '/((?!api|_next|.*\\.).*)',
  ],
};
