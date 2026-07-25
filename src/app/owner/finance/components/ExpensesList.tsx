'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button, Card, CardContent } from '@/components/ui'

interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: string
  property: { id: string; title: string; address: string }
}

interface ExpensesListProps {
  expenses: Expense[]
}

const CATEGORY_LABELS: Record<string, string> = {
  REPAIR: 'Ремонт',
  UTILITIES: 'Коммунальные',
  MAINTENANCE: 'Обслуживание',
  OTHER: 'Прочее',
}

const CATEGORY_STYLES: Record<string, string> = {
  REPAIR: 'bg-orange-100 text-orange-800',
  UTILITIES: 'bg-blue-100 text-blue-800',
  MAINTENANCE: 'bg-purple-100 text-purple-800',
  OTHER: 'bg-gray-100 text-gray-800',
}

/** Список расходов собственника. */
export function ExpensesList({ expenses }: ExpensesListProps) {
  const [items, setItems] = useState(expenses)
  const [processing, setProcessing] = useState<string | null>(null)
  const router = useRouter()

  async function handleDelete(expenseId: string) {
    if (!confirm('Удалить расход?')) return

    setProcessing(expenseId)

    try {
      const res = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Ошибка')
        return
      }

      setItems((prev) => prev.filter((e) => e.id !== expenseId))
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
          <p className="text-muted-foreground">Нет расходов</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((expense) => (
        <Card key={expense.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1 text-sm">
                <div className="font-medium">{expense.description}</div>
                <div className="text-muted-foreground">{expense.property.title}</div>
                <div>
                  <span className="text-muted-foreground">Сумма: </span>
                  <span className="font-medium text-red-600">{expense.amount.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Дата: </span>
                  <span>{new Date(expense.date).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_STYLES[expense.category] || ''}`}>
                  {CATEGORY_LABELS[expense.category] || expense.category}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(expense.id)}
                  disabled={processing === expense.id}
                >
                  {processing === expense.id ? '...' : 'Удалить'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
