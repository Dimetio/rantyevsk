'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface Property {
  id: string
  title: string
}

interface Tenant {
  id: string
  name: string
}

interface CreateTaskFormProps {
  properties: Property[]
  tenants: Tenant[]
}

const PRIORITIES = [
  { value: 'LOW', label: 'Низкий' },
  { value: 'MEDIUM', label: 'Средний' },
  { value: 'HIGH', label: 'Высокий' },
]

/** Форма создания новой задачи. */
export function CreateTaskForm({ properties, tenants }: CreateTaskFormProps) {
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
      description: formData.get('description') as string,
      propertyId: formData.get('propertyId') as string,
      assignedToId: formData.get('assignedToId') as string || undefined,
      priority: formData.get('priority') as string,
      dueDate: formData.get('dueDate') as string || undefined,
    }

    try {
      const res = await fetch('/api/tasks', {
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
      <Button onClick={() => setOpen(true)}>
        + Новая задача
      </Button>
    )
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-sm">Новая задача</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="rounded-md bg-destructive/15 p-2 text-xs text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="title" className="text-xs">Название</Label>
            <Input id="title" name="title" placeholder="Поменять замок" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description" className="text-xs">Описание</Label>
            <textarea
              id="description"
              name="description"
              rows={2}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
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
            <Label htmlFor="assignedToId" className="text-xs">Назначить</Label>
            <select
              id="assignedToId"
              name="assignedToId"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="">Не назначать</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="priority" className="text-xs">Приоритет</Label>
              <select
                id="priority"
                name="priority"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="dueDate" className="text-xs">Срок</Label>
              <Input id="dueDate" name="dueDate" type="date" className="h-9" />
            </div>
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
