import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { SignOutButton } from '@/components/compound/SignOutButton'
import { TenantPaymentsList } from './components/TenantPaymentsList'

/** Страница платежей арендатора. */
export default async function TenantPaymentsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'TENANT') {
    redirect('/owner')
  }

  const payments = await prisma.payment.findMany({
    where: { tenantId: session.user.id },
    include: {
      property: {
        select: { id: true, title: true, address: true, rentPrice: true },
      },
    },
    orderBy: { dueDate: 'desc' },
  })

  const totalPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const totalPending = payments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const totalOverdue = payments
    .filter((p) => p.status === 'OVERDUE')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/tenant">
              <Button variant="ghost" size="sm">← Назад</Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Rantyevsk</h1>
              <p className="text-sm text-muted-foreground">Мои платежи</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{session.user.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Оплачено</CardDescription>
              <CardTitle className="text-2xl text-green-600">{totalPaid.toLocaleString('ru-RU')} ₽</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Ожидает оплаты</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">{totalPending.toLocaleString('ru-RU')} ₽</CardTitle>
            </CardHeader>
          </Card>
          {totalOverdue > 0 && (
            <Card>
              <CardHeader>
                <CardDescription>Просрочено</CardDescription>
                <CardTitle className="text-2xl text-red-600">{totalOverdue.toLocaleString('ru-RU')} ₽</CardTitle>
              </CardHeader>
            </Card>
          )}
        </div>

        <TenantPaymentsList payments={payments.map((p) => ({
          ...p,
          amount: Number(p.amount),
          dueDate: p.dueDate.toISOString(),
          paidDate: p.paidDate?.toISOString() ?? null,
          property: {
            ...p.property,
            rentPrice: Number(p.property.rentPrice),
          },
        }))} />
      </div>
    </main>
  )
}
