'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface Property {
  id: string
  title: string
  address: string
}

interface CreatePaymentFormProps {
  properties: Property[]
}

/** Форма создания нового платежа. */
export function CreatePaymentForm({ properties }: CreatePaymentFormProps) {
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
      propertyId: formData.get('propertyId') as string,
      amount: formData.get('amount') as string,
      dueDate: formData.get('dueDate') as string,
      message: formData.get('message') as string,
    }

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        setError(result.error || 'Ошибка')
        return
      }

      setOpen(false)
      router.refresh()
    } catch {
      setError('Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        + Создать платёж
      </Button>
    )
  }

  return (
    <Card className="absolute right-0 top-12 z-10 w-80">
      <CardHeader>
        <CardTitle className="text-sm">Новый платёж</CardTitle>
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
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm"
              required
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="amount" className="text-xs">Сумма (₽)</Label>
            <Input id="amount" name="amount" type="number" placeholder="80000" required className="h-8" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="dueDate" className="text-xs">Дата оплаты</Label>
            <Input id="dueDate" name="dueDate" type="date" required className="h-8" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="message" className="text-xs">Комментарий</Label>
            <Input id="message" name="message" placeholder="Необязательно" className="h-8" />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="flex-1">
              Отмена
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="flex-1">
              {loading ? '...' : 'Создать'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
