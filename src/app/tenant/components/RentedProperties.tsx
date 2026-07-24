'use client'

import { useState } from 'react'

import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Label } from '@/components/ui'

interface RentedProperty {
  id: string
  title: string
  address: string
  rentPrice: number
  area: number | null
  rooms: number | null
  floor: number | null
  rentStart: string | null
  rentEnd: string | null
  owner: {
    name: string
    email: string
  }
}

interface RentedPropertiesProps {
  properties: RentedProperty[]
}

/** Арендованные квартиры арендатора с возможностью завершить аренду. */
export function RentedProperties({ properties }: RentedPropertiesProps) {
  const [items, setItems] = useState(properties)
  const [processing, setProcessing] = useState<string | null>(null)
  const [terminatingId, setTerminatingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  async function handleTerminate(propertyId: string) {
    setProcessing(propertyId)

    try {
      const res = await fetch('/api/termination-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, message: message || undefined }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Ошибка')
        return
      }

      setTerminatingId(null)
      setMessage('')
      alert('Заявка на расторжение отправлена. Ожидайте подтверждения собственника.')
    } catch {
      alert('Произошла ошибка')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold">Мои квартиры</h2>
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              У вас пока нет арендованных квартир
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((property) => (
            <Card key={property.id}>
              <CardHeader>
                <CardTitle>{property.title}</CardTitle>
                <CardDescription>{property.address}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Аренда: </span>
                    <span className="font-medium">{property.rentPrice.toLocaleString('ru-RU')} ₽/мес</span>
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
                  <div>
                    <span className="text-muted-foreground">Собственник: </span>
                    <span className="font-medium">{property.owner.name}</span>
                  </div>
                  {property.rentEnd && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Окончание аренды: </span>
                      <span className="font-medium">
                        {new Date(property.rentEnd).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  )}
                </div>

                {terminatingId === property.id ? (
                  <div className="space-y-2 border-t pt-3">
                    <Label>Комментарий (необязательно)</Label>
                    <Input
                      placeholder="Причина расторжения..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => { setTerminatingId(null); setMessage('') }}
                        disabled={processing === property.id}
                        className="flex-1"
                      >
                        Отмена
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleTerminate(property.id)}
                        disabled={processing === property.id}
                        className="flex-1"
                      >
                        {processing === property.id ? '...' : 'Подтвердить'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTerminatingId(property.id)}
                    className="w-full"
                  >
                    Завершить аренду
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
