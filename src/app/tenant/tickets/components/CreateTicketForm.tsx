'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface Property {
  id: string
  title: string
}

interface CreateTicketFormProps {
  properties: Property[]
}

/** Форма создания новой заявки. */
export function CreateTicketForm({ properties }: CreateTicketFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title') as string,
      propertyId: formData.get('propertyId') as string,
      message: formData.get('message') as string,
    }

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        setError(result.error || 'Ошибка')
        return
      }

      const ticket = await res.json()
      setOpen(false)
      router.push(`/tenant/tickets/${ticket.id}`)
    } catch {
      setError('Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        + Новая заявка
      </Button>
    )
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-sm">Новая заявка</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="rounded-md bg-destructive/15 p-2 text-xs text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="propertyId" className="text-xs">Объект</Label>
            <select
              id="propertyId"
              name="propertyId"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              required
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="title" className="text-xs">Тема</Label>
            <Input id="title" name="title" placeholder="Проблема с отоплением" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="message" className="text-xs">Сообщение</Label>
            <textarea
              id="message"
              name="message"
              rows={3}
              placeholder="Опишите проблему подробнее..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="flex-1">
              Отмена
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="flex-1">
              {loading ? '...' : 'Отправить'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
