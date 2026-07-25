import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { SignOutButton } from '@/components/compound/SignOutButton'
import { PaymentsList } from './components/PaymentsList'
import { ExpensesList } from './components/ExpensesList'
import { CreatePaymentForm } from './components/CreatePaymentForm'
import { CreateExpenseForm } from './components/CreateExpenseForm'

/** Финансовый дашборд собственника — платежи, расходы, сводка. */
export default async function OwnerFinancePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'OWNER') {
    redirect('/tenant')
  }

  const payments = await prisma.payment.findMany({
    where: {
      property: { ownerId: session.user.id },
    },
    include: {
      tenant: {
        select: { id: true, name: true, email: true },
      },
      property: {
        select: { id: true, title: true, address: true },
      },
    },
    orderBy: { dueDate: 'desc' },
  })

  const expenses = await prisma.expense.findMany({
    where: {
      property: { ownerId: session.user.id },
    },
    include: {
      property: {
        select: { id: true, title: true, address: true },
      },
    },
    orderBy: { date: 'desc' },
  })

  const properties = await prisma.property.findMany({
    where: {
      ownerId: session.user.id,
      status: 'RENTED',
      tenantId: { not: null },
    },
    select: {
      id: true,
      title: true,
      address: true,
    },
  })

  const totalPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const totalPending = payments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  const netIncome = totalPaid - totalExpenses

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
              <p className="text-sm text-muted-foreground">Финансы</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{session.user.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader>
              <CardDescription>Получено</CardDescription>
              <CardTitle className="text-2xl text-green-600">{totalPaid.toLocaleString('ru-RU')} ₽</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Ожидается</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">{totalPending.toLocaleString('ru-RU')} ₽</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Расходы</CardDescription>
              <CardTitle className="text-2xl text-red-600">{totalExpenses.toLocaleString('ru-RU')} ₽</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Чистый доход</CardDescription>
              <CardTitle className={`text-2xl ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netIncome.toLocaleString('ru-RU')} ₽
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Платежи</h2>
              <CreatePaymentForm properties={properties} />
            </div>
            <PaymentsList payments={payments.map((p) => ({
              ...p,
              amount: Number(p.amount),
              createdAt: p.createdAt.toISOString(),
              updatedAt: p.updatedAt.toISOString(),
              dueDate: p.dueDate.toISOString(),
              paidDate: p.paidDate?.toISOString() ?? null,
            }))} />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Расходы</h2>
              <CreateExpenseForm properties={properties} />
            </div>
            <ExpensesList expenses={expenses.map((e) => ({
              ...e,
              amount: Number(e.amount),
              createdAt: e.createdAt.toISOString(),
              updatedAt: e.updatedAt.toISOString(),
              date: e.date.toISOString(),
            }))} />
          </div>
        </div>
      </div>
    </main>
  )
}
