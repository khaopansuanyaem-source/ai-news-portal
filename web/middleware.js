import { NextResponse } from 'next/server';

export function middleware(req) {
  const url = req.nextUrl;

  // Protect only the /admin path
  if (url.pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      // Decode base64: atob is supported in Next.js edge runtime
      const [user, pwd] = atob(authValue).split(':');

      const expectedUser = process.env.ADMIN_USER || 'admin';
      const expectedPassword = process.env.ADMIN_PASSWORD || 'cyber2026';

      if (user === expectedUser && pwd === expectedPassword) {
        return NextResponse.next();
      }
    }

    // Return 401 if unauthorized, prompting the browser's native login dialog
    return new NextResponse('Auth required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }

  return NextResponse.next();
}

// Config to run middleware only on specific paths
export const config = {
  matcher: ['/admin/:path*'],
};
