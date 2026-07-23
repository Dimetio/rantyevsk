import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

/** Middleware для проверки ролей и редиректа. */
export default auth((req) => {
  const { pathname } = req.nextUrl

  // Публичные маршруты
  if (
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next()
  }

  // Если не авторизован — на логин
  if (!req.auth) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = req.auth.user?.role

  // Собственник не должен попадать на /tenant
  if (role === 'OWNER' && pathname.startsWith('/tenant')) {
    return NextResponse.redirect(new URL('/owner', req.url))
  }

  // Арендатор не должен попадать на /owner
  if (role === 'TENANT' && pathname.startsWith('/owner')) {
    return NextResponse.redirect(new URL('/tenant', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
