import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Login sayfası için kontrol yapma
  if (pathname === '/login') {
    return NextResponse.next()
  }

  // Diğer sayfalar için cookie kontrolü (localStorage yerine cookie kullanacağız)
  // Şimdilik client-side kontrol yapılacak, bu yüzden burada sadece geçiş yapıyoruz
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}


