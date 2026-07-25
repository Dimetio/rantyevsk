'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button, Card, CardContent } from '@/components/ui'

interface Payment {
  id: string
  amount: number
  status: string
  dueDate: string
  paidDate: string | null
  message: string | null
  property: { id: string; title: string; address: string; rentPrice: number }
}

interface TenantPaymentsListProps {
  payments: Payment[]
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Ожидает',
  PAID: 'Оплачен',
  OVERDUE: 'Просрочен',
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
}

/** Список платежей арендатора с возможностью оплаты. */
export function TenantPaymentsList({ payments }: TenantPaymentsListProps) {
  const [items, setItems] = useState(payments)
  const [processing, setProcessing] = useState<string | null>(null)
  const router = useRouter()

  async function handleMarkPaid(paymentId: string) {
    setProcessing(paymentId)

    try {
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID' }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Ошибка')
        return
      }

      setItems((prev) =>
        prev.map((p) =>
          p.id === paymentId ? { ...p, status: 'PAID', paidDate: new Date().toISOString() } : p
        )
      )
      router.refresh()
    } catch {
      alert('Произошла ошибка')
    } finally {
      setProcessing(null)
    }
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">У вас пока нет платежей</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((payment) => (
        <Card key={payment.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1 text-sm">
                <div className="font-medium">{payment.property.title}</div>
                <div className="text-muted-foreground">{payment.property.address}</div>
                <div>
                  <span className="text-muted-foreground">Сумма: </span>
                  <span className="font-medium">{payment.amount.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Срок оплаты: </span>
                  <span>{new Date(payment.dueDate).toLocaleDateString('ru-RU')}</span>
                </div>
                {payment.paidDate && (
                  <div>
                    <span className="text-muted-foreground">Оплачен: </span>
                    <span>{new Date(payment.paidDate).toLocaleDateString('ru-RU')}</span>
                  </div>
                )}
                {payment.message && (
                  <div>
                    <span className="text-muted-foreground">Комментарий: </span>
                    <span>{payment.message}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[payment.status] || ''}`}>
                  {STATUS_LABELS[payment.status] || payment.status}
                </span>
                {payment.status === 'PENDING' && (
                  <Button
                    size="sm"
                    onClick={() => handleMarkPaid(payment.id)}
                    disabled={processing === payment.id}
                  >
                    {processing === payment.id ? '...' : 'Оплатить'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
