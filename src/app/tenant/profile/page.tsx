'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui'
import { SignOutButton } from '@/components/compound/SignOutButton'

/** Страница профиля арендатора — просмотр и редактирование контактных данных. */
export default function TenantProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [profile, setProfile] = useState<{
    id: string
    name: string
    email: string
    phone: string | null
    role: string
  } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/user/profile')
        if (!res.ok) {
          setError('Ошибка загрузки профиля')
          return
        }
        const data = await res.json()
        setProfile(data)
      } catch {
        setError('Ошибка загрузки профиля')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Ошибка сохранения')
        return
      }

      const updated = await res.json()
      setProfile(updated)
      setSuccess('Профиль обновлён')
    } catch {
      setError('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">Профиль не найден</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/tenant">
              <Button variant="ghost" size="sm">← Назад</Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Rantyevsk</h1>
              <p className="text-sm text-muted-foreground">Мой профиль</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{profile.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Личные данные</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-md bg-green-100 p-3 text-sm text-green-800">
                  {success}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input id="name" name="name" defaultValue={profile.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile.email} disabled />
                <p className="text-xs text-muted-foreground">Email нельзя изменить</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input id="phone" name="phone" defaultValue={profile.phone || ''} placeholder="+7 (999) 123-45-67" />
              </div>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => router.push('/tenant')}>
                Отмена
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  )
}
