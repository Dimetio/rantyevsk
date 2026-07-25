'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface Property {
  id: string
  title: string
  address: string
}

interface CreateExpenseFormProps {
  properties: Property[]
}

const CATEGORIES = [
  { value: 'REPAIR', label: 'Ремонт' },
  { value: 'UTILITIES', label: 'Коммунальные' },
  { value: 'MAINTENANCE', label: 'Обслуживание' },
  { value: 'OTHER', label: 'Прочее' },
]

/** Форма создания нового расхода. */
export function CreateExpenseForm({ properties }: CreateExpenseFormProps) {
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
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      date: formData.get('date') as string,
    }

    try {
      const res = await fetch('/api/expenses', {
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
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        + Добавить расход
      </Button>
    )
  }

  return (
    <Card className="absolute right-0 top-12 z-10 w-80">
      <CardHeader>
        <CardTitle className="text-sm">Новый расход</CardTitle>
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
            <Label htmlFor="category" className="text-xs">Категория</Label>
            <select
              id="category"
              name="category"
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="amount" className="text-xs">Сумма (₽)</Label>
            <Input id="amount" name="amount" type="number" placeholder="5000" required className="h-8" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description" className="text-xs">Описание</Label>
            <Input id="description" name="description" placeholder="Замена смесителя" required className="h-8" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="date" className="text-xs">Дата</Label>
            <Input id="date" name="date" type="date" className="h-8" />
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
