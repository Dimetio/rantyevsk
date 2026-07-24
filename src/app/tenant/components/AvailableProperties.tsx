'use client'

import { useState } from 'react'

import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Label } from '@/components/ui'

interface Property {
  id: string
  title: string
  address: string
  description: string | null
  area: number | null
  rooms: number | null
  floor: number | null
  rentPrice: number
}

interface AvailablePropertiesProps {
  properties: Property[]
  existingRequestPropertyIds: string[]
}

/** Список доступных квартир с возможностью отправить заявку. */
export function AvailableProperties({ properties, existingRequestPropertyIds }: AvailablePropertiesProps) {
  const [sending, setSending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sentIds, setSentIds] = useState<string[]>(existingRequestPropertyIds)

  async function handleApply(propertyId: string, message: string) {
    setSending(propertyId)
    setError(null)

    try {
      const res = await fetch('/api/rental-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, message: message || undefined }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Ошибка при отправке заявки')
        return
      }

      setSentIds((prev) => [...prev, propertyId])
    } catch {
      setError('Произошла ошибка при отправке заявки')
    } finally {
      setSending(null)
    }
  }

  if (properties.length === 0) {
    return null
  }

  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold">Доступные квартиры</h2>
      {error && (
        <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {properties.map((property) => {
          const alreadySent = sentIds.includes(property.id)
          return (
            <Card key={property.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{property.title}</CardTitle>
                    <CardDescription>{property.address}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {property.description && (
                  <p className="text-sm text-muted-foreground">{property.description}</p>
                )}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Аренда: </span>
                    <span className="font-medium">{Number(property.rentPrice).toLocaleString('ru-RU')} ₽/мес</span>
                  </div>
                  {property.area && (
                    <div>
                      <span className="text-muted-foreground">Площадь: </span>
                      <span className="font-medium">{Number(property.area)} м²</span>
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
                </div>
                {alreadySent ? (
                  <Button disabled variant="outline" className="w-full">
                    Заявка отправлена
                  </Button>
                ) : (
                  <ApplyButton
                    propertyId={property.id}
                    loading={sending === property.id}
                    onApply={handleApply}
                  />
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

function ApplyButton({
  propertyId,
  loading,
  onApply,
}: {
  propertyId: string
  loading: boolean
  onApply: (propertyId: string, message: string) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)} className="w-full">
        Заявить на аренду
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      <Input
        placeholder="Комментарий (необязательно)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setShowForm(false)}
          disabled={loading}
          className="flex-1"
        >
          Отмена
        </Button>
        <Button
          onClick={() => onApply(propertyId, message)}
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Отправка...' : 'Отправить'}
        </Button>
      </div>
    </div>
  )
}
