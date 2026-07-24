'use client'

import { useState } from 'react'

import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'

interface TerminationRequest {
  id: string
  message: string | null
  createdAt: Date
  initiatedBy: {
    id: string
    name: string
    email: string
  }
  property: {
    id: string
    title: string
    address: string
  }
}

interface TerminationRequestsListProps {
  requests: TerminationRequest[]
}

/** Входящие заявки на расторжение от собственника. */
export function TerminationRequestsList({ requests }: TerminationRequestsListProps) {
  const [items, setItems] = useState(requests)
  const [processing, setProcessing] = useState<string | null>(null)

  async function handleAction(requestId: string, status: 'APPROVED' | 'REJECTED') {
    setProcessing(requestId)

    try {
      const res = await fetch(`/api/termination-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const data = await res.json()

      if (!res.ok) {
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
      <h2 className="mb-4 text-2xl font-bold">Заявки на расторжение ({items.length})</h2>
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
                  <span className="text-muted-foreground">От: </span>
                  <span className="font-medium">{request.initiatedBy.name}</span>
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
                  variant="destructive"
                  onClick={() => handleAction(request.id, 'APPROVED')}
                  disabled={processing === request.id}
                  className="flex-1"
                >
                  {processing === request.id ? '...' : 'Согласиться'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
