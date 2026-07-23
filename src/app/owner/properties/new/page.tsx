'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui'
import { propertySchema } from '@/validations'

/** Страница создания нового объекта недвижимости. */
export default function NewPropertyPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title') as string,
      address: formData.get('address') as string,
      description: formData.get('description') as string,
      area: formData.get('area') as string,
      rooms: formData.get('rooms') as string,
      floor: formData.get('floor') as string,
      rentPrice: formData.get('rentPrice') as string,
      status: formData.get('status') as 'AVAILABLE' | 'RENTED' | 'MAINTENANCE',
    }

    const result = propertySchema.safeParse(data)
    if (!result.success) {
      setError(result.error.errors[0].message)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const res = await response.json()

      if (!response.ok) {
        setError(res.error || 'Ошибка при создании объекта')
        return
      }

      router.push('/owner')
      router.refresh()
    } catch {
      setError('Произошла ошибка при создании объекта')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            ← Назад
          </Button>
          <h1 className="text-xl font-bold">Новый объект</h1>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Добавить объект недвижимости</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="title">Название *</Label>
                <Input id="title" name="title" placeholder="Квартира на Тверской" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Адрес *</Label>
                <Input id="address" name="address" placeholder="г. Москва, ул. Тверская, д. 1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Input id="description" name="description" placeholder="Описание объекта (необязательно)" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">Площадь (м²)</Label>
                  <Input id="area" name="area" type="number" step="0.01" placeholder="45.5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rooms">Комнаты</Label>
                  <Input id="rooms" name="rooms" type="number" placeholder="2" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">Этаж</Label>
                  <Input id="floor" name="floor" type="number" placeholder="5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rentPrice">Стоимость аренды (₽/мес) *</Label>
                  <Input id="rentPrice" name="rentPrice" type="number" placeholder="80000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Статус</Label>
                  <select
                    id="status"
                    name="status"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="AVAILABLE">Свободен</option>
                    <option value="RENTED">Сдан</option>
                    <option value="MAINTENANCE">Обслуживание</option>
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Отмена
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Создание...' : 'Создать объект'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  )
}
