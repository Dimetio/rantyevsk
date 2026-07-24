'use client'

import { useState } from 'react'

import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Label } from '@/components/ui'

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

/** Входящие заявки собственника с указанием срока аренды. */
export function IncomingRequests({ requests }: IncomingRequestsProps) {
  const [items, setItems] = useState(requests)
  const [processing, setProcessing] = useState<string | null>(null)

  async function handleApprove(requestId: string, rentEnd: string) {
    setProcessing(requestId)

    try {
      const res = await fetch(`/api/rental-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED', rentEnd }),
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

  async function handleReject(requestId: string) {
    setProcessing(requestId)

    try {
      const res = await fetch(`/api/rental-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' }),
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
          <RequestCard
            key={request.id}
            request={request}
            processing={processing === request.id}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))}
      </div>
    </section>
  )
}

function RequestCard({
  request,
  processing,
  onApprove,
  onReject,
}: {
  request: Request
  processing: boolean
  onApprove: (id: string, rentEnd: string) => void
  onReject: (id: string) => void
}) {
  const [rentEnd, setRentEnd] = useState('')

  return (
    <Card>
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

        <div className="space-y-2">
          <Label htmlFor={`rentEnd-${request.id}`}>Дата окончания аренды *</Label>
          <Input
            id={`rentEnd-${request.id}`}
            type="date"
            value={rentEnd}
            onChange={(e) => setRentEnd(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onReject(request.id)}
            disabled={processing}
            className="flex-1"
          >
            Отклонить
          </Button>
          <Button
            onClick={() => onApprove(request.id, rentEnd)}
            disabled={processing || !rentEnd}
            className="flex-1"
          >
            {processing ? '...' : 'Принять'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
