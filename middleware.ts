// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Basic Auth middleware pour protéger /admin/*
 */
export function middleware(request: NextRequest) {
  // Ne protéger que les routes /admin
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Récupérer les credentials depuis les variables d'environnement
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  // Si pas de password configuré, bloquer l'accès
  if (!ADMIN_PASSWORD) {
    console.error('❌ [ADMIN] ADMIN_PASSWORD not configured');
    return new NextResponse('Admin access not configured', { status: 503 });
  }

  // Vérifier l'en-tête Authorization
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Marty\'s Squad Admin"',
      },
    });
  }

  // Décoder les credentials
  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    // Vérifier les credentials
    if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
      return NextResponse.next();
    }
  } catch {
    // Credentials mal formatés
  }

  // Credentials invalides
  return new NextResponse('Invalid credentials', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Marty\'s Squad Admin"',
    },
  });
}

export const config = {
  matcher: '/admin/:path*',
};
