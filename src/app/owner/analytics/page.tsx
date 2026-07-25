import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { SignOutButton } from '@/components/compound/SignOutButton'
import { SummaryCards } from './components/SummaryCards'
import { PaymentChart } from './components/PaymentChart'
import { ExpenseChart } from './components/ExpenseChart'
import { RevenueByProperty } from './components/RevenueByProperty'
import { MonthlyTrend } from './components/MonthlyTrend'
import { ActivityStats } from './components/ActivityStats'

/** Страница аналитики собственника. */
export default async function OwnerAnalyticsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'OWNER') {
    redirect('/tenant')
  }

  const ownerId = session.user.id

  const [properties, payments, expenses, tickets, tasks] = await Promise.all([
    prisma.property.findMany({
      where: { ownerId },
      select: { id: true, title: true, status: true, rentPrice: true },
    }),
    prisma.payment.findMany({
      where: { property: { ownerId } },
      select: { amount: true, status: true, dueDate: true, paidDate: true, propertyId: true },
    }),
    prisma.expense.findMany({
      where: { property: { ownerId } },
      select: { amount: true, category: true, propertyId: true, date: true },
    }),
    prisma.ticket.findMany({
      where: { property: { ownerId } },
      select: { id: true, status: true },
    }),
    prisma.task.findMany({
      where: { createdById: ownerId },
      select: { id: true, status: true },
    }),
  ])

  const totalProperties = properties.length
  const rentedProperties = properties.filter((p) => p.status === 'RENTED').length
  const availableProperties = properties.filter((p) => p.status === 'AVAILABLE').length
  const occupancyRate = totalProperties > 0 ? Math.round((rentedProperties / totalProperties) * 100) : 0

  const totalPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((s, p) => s + Number(p.amount), 0)
  const totalPending = payments
    .filter((p) => p.status === 'PENDING')
    .reduce((s, p) => s + Number(p.amount), 0)
  const totalOverdue = payments
    .filter((p) => p.status === 'OVERDUE')
    .reduce((s, p) => s + Number(p.amount), 0)
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const netProfit = totalPaid - totalExpenses

  const paymentStatus = {
    PAID: payments.filter((p) => p.status === 'PAID').length,
    PENDING: payments.filter((p) => p.status === 'PENDING').length,
    OVERDUE: payments.filter((p) => p.status === 'OVERDUE').length,
  }

  const expenseByCategory: Record<string, number> = {}
  expenses.forEach((e) => {
    expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + Number(e.amount)
  })

  const revenueByProperty = properties.map((prop) => {
    const propPaid = payments
      .filter((p) => p.propertyId === prop.id && p.status === 'PAID')
      .reduce((s, p) => s + Number(p.amount), 0)
    const propExpenses = expenses
      .filter((e) => e.propertyId === prop.id)
      .reduce((s, e) => s + Number(e.amount), 0)
    return {
      id: prop.id,
      title: prop.title,
      rentPrice: Number(prop.rentPrice),
      paid: propPaid,
      expenses: propExpenses,
      net: propPaid - propExpenses,
    }
  })

  const now = new Date()
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const year = d.getFullYear()
    const month = d.getMonth()
    const label = d.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' })

    const monthPayments = payments.filter((p) => {
      const pd = p.paidDate || p.dueDate
      return pd.getFullYear() === year && pd.getMonth() === month && p.status === 'PAID'
    })
    const monthExpenses = expenses.filter((e) => {
      return e.date.getFullYear() === year && e.date.getMonth() === month
    })

    return {
      label,
      income: monthPayments.reduce((s, p) => s + Number(p.amount), 0),
      expenses: monthExpenses.reduce((s, e) => s + Number(e.amount), 0),
    }
  })

  const taskStatus = {
    TODO: tasks.filter((t) => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    DONE: tasks.filter((t) => t.status === 'DONE').length,
  }

  const ticketStatus = {
    OPEN: tickets.filter((t) => t.status === 'OPEN').length,
    IN_PROGRESS: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    RESOLVED: tickets.filter((t) => t.status === 'RESOLVED').length,
    CLOSED: tickets.filter((t) => t.status === 'CLOSED').length,
  }

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/owner">
              <Button variant="ghost" size="sm">← Назад</Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Rantyevsk</h1>
              <p className="text-sm text-muted-foreground">Аналитика</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{session.user.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        <SummaryCards
          totalProperties={totalProperties}
          rentedProperties={rentedProperties}
          availableProperties={availableProperties}
          occupancyRate={occupancyRate}
          totalPaid={totalPaid}
          totalPending={totalPending}
          totalOverdue={totalOverdue}
          totalExpenses={totalExpenses}
          netProfit={netProfit}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <PaymentChart data={paymentStatus} total={payments.length} />
          <ExpenseChart data={expenseByCategory} total={totalExpenses} />
        </div>

        <MonthlyTrend data={monthlyTrend} />

        <RevenueByProperty data={revenueByProperty} />

        <div className="grid gap-6 md:grid-cols-2">
          <ActivityStats
            title="Задачи"
            statuses={[
              { label: 'К выполнению', count: taskStatus.TODO, color: 'bg-yellow-500' },
              { label: 'В работе', count: taskStatus.IN_PROGRESS, color: 'bg-blue-500' },
              { label: 'Выполнено', count: taskStatus.DONE, color: 'bg-green-500' },
            ]}
          />
          <ActivityStats
            title="Заявки"
            statuses={[
              { label: 'Открытые', count: ticketStatus.OPEN, color: 'bg-red-500' },
              { label: 'В обработке', count: ticketStatus.IN_PROGRESS, color: 'bg-blue-500' },
              { label: 'Решено', count: ticketStatus.RESOLVED, color: 'bg-green-500' },
              { label: 'Закрыто', count: ticketStatus.CLOSED, color: 'bg-gray-400' },
            ]}
          />
        </div>
      </div>
    </main>
  )
}
