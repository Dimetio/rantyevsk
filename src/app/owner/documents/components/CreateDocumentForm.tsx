'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface Property {
  id: string
  title: string
}

interface CreateDocumentFormProps {
  properties: Property[]
}

const TYPES = [
  { value: 'CONTRACT', label: 'Договор' },
  { value: 'ACT', label: 'Акт' },
  { value: 'RECEIPT', label: 'Квитанция' },
  { value: 'OTHER', label: 'Прочее' },
]

/** Форма добавления документа. В реальном приложении здесь будет загрузка файла. */
export function CreateDocumentForm({ properties }: CreateDocumentFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const type = formData.get('type') as string
    const propertyId = formData.get('propertyId') as string
    const fileName = formData.get('fileName') as string

    const data = {
      title,
      type,
      propertyId,
      fileUrl: '#',
      fileName: fileName || title,
    }

    try {
      const res = await fetch('/api/documents', {
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
        + Добавить документ
      </Button>
    )
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-sm">Новый документ</CardTitle>
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
            <Input id="title" name="title" placeholder="Договор аренды №1" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="type" className="text-xs">Тип</Label>
            <select
              id="type"
              name="type"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
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
            <Label htmlFor="fileName" className="text-xs">Имя файла</Label>
            <Input id="fileName" name="fileName" placeholder="dogovor.pdf" />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="flex-1">
              Отмена
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="flex-1">
              {loading ? '...' : 'Добавить'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
