import Link from 'next/link'

import { Button } from '@/components/ui'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Rantyevsk</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Цифровая платформа управления арендной недвижимостью
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/login">
            <Button>Войти</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline">Регистрация</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
