'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui'

/** Страница просмотра и редактирования объекта недвижимости. */
export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/properties/${params.id}`)
        if (!res.ok) {
          setError('Объект не найден')
          return
        }
        const data = await res.json()
        setProperty(data)
      } catch {
        setError('Ошибка загрузки объекта')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const res = await fetch(`/api/properties/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || 'Ошибка сохранения')
        return
      }

      const updated = await res.json()
      setProperty(updated)
      setEditing(false)
    } catch {
      setError('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Удалить объект? Это действие нельзя отменить.')) return

    try {
      const res = await fetch(`/api/properties/${params.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        setError('Ошибка удаления')
        return
      }

      router.push('/owner')
      router.refresh()
    } catch {
      setError('Ошибка удаления')
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </main>
    )
  }

  if (error && !property) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">{error}</p>
      </main>
    )
  }

  const statusLabels: Record<string, string> = {
    AVAILABLE: 'Свободен',
    RENTED: 'Сдан в аренду',
    MAINTENANCE: 'На обслуживании',
  }

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            ← Назад
          </Button>
          <h1 className="text-xl font-bold">{property.title}</h1>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {error && (
          <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!editing ? (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{property.title}</CardTitle>
                  <p className="text-muted-foreground">{property.address}</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {statusLabels[property.status]}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {property.description && (
                <p className="text-sm">{property.description}</p>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Аренда: </span>
                  <span className="font-medium">{Number(property.rentPrice).toLocaleString('ru-RU')} ₽/мес</span>
                </div>
                {property.area && (
                  <div>
                    <span className="text-muted-foreground">Площадь: </span>
                    <span className="font-medium">{property.area} м²</span>
                  </div>
                )}
                {property.rooms && (
                  <div>
                    <span className="text-muted-foreground">Комнаты: </span>
                    <span className="font-medium">{property.rooms}</span>
                  </div>
                )}
                {property.floor && (
                  <div>
                    <span className="text-muted-foreground">Этаж: </span>
                    <span className="font-medium">{property.floor}</span>
                  </div>
                )}
                {property.tenant && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Арендатор: </span>
                    <span className="font-medium">{property.tenant.name} ({property.tenant.email})</span>
                  </div>
                )}
                {property.rentStart && (
                  <div>
                    <span className="text-muted-foreground">Начало аренды: </span>
                    <span className="font-medium">{new Date(property.rentStart).toLocaleDateString('ru-RU')}</span>
                  </div>
                )}
                {property.rentEnd && (
                  <div>
                    <span className="text-muted-foreground">Окончание аренды: </span>
                    <span className="font-medium">{new Date(property.rentEnd).toLocaleDateString('ru-RU')}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button onClick={() => setEditing(true)}>Редактировать</Button>
              <Button variant="destructive" onClick={handleDelete}>Удалить</Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <form onSubmit={handleSave}>
              <CardHeader>
                <CardTitle>Редактирование объекта</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Название</Label>
                  <Input id="title" name="title" defaultValue={property.title} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Адрес</Label>
                  <Input id="address" name="address" defaultValue={property.address} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Input id="description" name="description" defaultValue={property.description || ''} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="area">Площадь (м²)</Label>
                    <Input id="area" name="area" type="number" step="0.01" defaultValue={property.area || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rooms">Комнаты</Label>
                    <Input id="rooms" name="rooms" type="number" defaultValue={property.rooms || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floor">Этаж</Label>
                    <Input id="floor" name="floor" type="number" defaultValue={property.floor || ''} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rentPrice">Стоимость аренды (₽/мес)</Label>
                    <Input id="rentPrice" name="rentPrice" type="number" defaultValue={property.rentPrice} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Статус</Label>
                    <select
                      id="status"
                      name="status"
                      defaultValue={property.status}
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
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </main>
  )
}
