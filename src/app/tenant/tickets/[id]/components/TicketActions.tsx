'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button, Card, CardContent } from '@/components/ui'

interface TicketActionsProps {
  ticketId: string
  currentStatus: string
  userRole: string
}

const STATUS_OPTIONS = [
  { value: 'IN_PROGRESS', label: 'В работу' },
  { value: 'RESOLVED', label: 'Решена' },
  { value: 'CLOSED', label: 'Закрыть' },
]

/** Компонент управления статусом заявки. */
export function TicketActions({ ticketId, currentStatus, userRole }: TicketActionsProps) {
  const [processing, setProcessing] = useState<string | null>(null)
  const router = useRouter()

  async function handleStatusChange(status: string) {
    setProcessing(status)

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Ошибка')
        return
      }

      router.refresh()
    } catch {
      alert('Произошла ошибка')
    } finally {
      setProcessing(null)
    }
  }

  if (currentStatus === 'CLOSED') {
    return (
      <Card>
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Заявка закрыта
        </CardContent>
      </Card>
    )
  }

  const availableOptions = STATUS_OPTIONS.filter((opt) => {
    if (userRole === 'TENANT') {
      return opt.value === 'CLOSED'
    }
    return true
  })

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Действия:</span>
          <div className="flex gap-2">
            {availableOptions.map((opt) => (
              <Button
                key={opt.value}
                size="sm"
                variant={opt.value === 'RESOLVED' ? 'default' : 'outline'}
                onClick={() => handleStatusChange(opt.value)}
                disabled={processing === opt.value}
              >
                {processing === opt.value ? '...' : opt.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
