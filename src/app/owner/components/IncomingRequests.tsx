'use client'

import { useState } from 'react'

import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'

interface Request {
  id: string
  message: string | null
  createdAt: Date
  tenant: {
    id: string
    name: string
    email: string
  }
  property: {
    id: string
    title: string
    address: string
    rentPrice: number
  }
}

interface IncomingRequestsProps {
  requests: Request[]
}

/** Входящие заявки собственника с кнопками одобрения/отклонения. */
export function IncomingRequests({ requests }: IncomingRequestsProps) {
  const [items, setItems] = useState(requests)
  const [processing, setProcessing] = useState<string | null>(null)

  async function handleAction(requestId: string, status: 'APPROVED' | 'REJECTED') {
    setProcessing(requestId)

    try {
      const res = await fetch(`/api/rental-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Ошибка')
        return
      }

      setItems((prev) => prev.filter((r) => r.id !== requestId))
    } catch {
      alert('Произошла ошибка')
    } finally {
      setProcessing(null)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold">Входящие заявки ({items.length})</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{request.property.title}</CardTitle>
                  <CardDescription>{request.property.address}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-muted-foreground">Арендатор: </span>
                  <span className="font-medium">{request.tenant.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email: </span>
                  <span>{request.tenant.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Аренда: </span>
                  <span className="font-medium">{Number(request.property.rentPrice).toLocaleString('ru-RU')} ₽/мес</span>
                </div>
                {request.message && (
                  <div>
                    <span className="text-muted-foreground">Комментарий: </span>
                    <span>{request.message}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleAction(request.id, 'REJECTED')}
                  disabled={processing === request.id}
                  className="flex-1"
                >
                  Отклонить
                </Button>
                <Button
                  onClick={() => handleAction(request.id, 'APPROVED')}
                  disabled={processing === request.id}
                  className="flex-1"
                >
                  {processing === request.id ? '...' : 'Принять'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
