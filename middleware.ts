import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? '';
  const { pathname } = req.nextUrl;

  if (host.startsWith('meet.')) {
    if (pathname === '/' || pathname === '') {
      const url = req.nextUrl.clone();
      url.pathname = '/meet';
      return NextResponse.rewrite(url);
    }

    if (!pathname.startsWith('/meet') && !pathname.startsWith('/api/meet') && !pathname.startsWith('/api/auth')) {
      const url = req.nextUrl.clone();
      url.pathname = `/meet${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
