'use client'

import { signOut } from 'next-auth/react'

import { Button } from '@/components/ui'

/** Кнопка выхода из системы. */
export function SignOutButton() {
  return (
    <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/auth/login' })}>
      Выйти
    </Button>
  )
}

export default SignOutButton
