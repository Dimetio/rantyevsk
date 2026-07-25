import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

/** GET /api/analytics — агрегированная аналитика для собственника. */
export async function GET() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const ownerId = session.user.id

  const [properties, payments, expenses, tickets, tasks] = await Promise.all([
    prisma.property.findMany({
      where: { ownerId },
      select: { id: true, title: true, status: true, rentPrice: true },
    }),
    prisma.payment.findMany({
      where: { property: { ownerId } },
      select: { id: true, amount: true, status: true, dueDate: true, paidDate: true, propertyId: true },
    }),
    prisma.expense.findMany({
      where: { property: { ownerId } },
      select: { id: true, amount: true, category: true, propertyId: true, date: true },
    }),
    prisma.ticket.findMany({
      where: { property: { ownerId } },
      select: { id: true, status: true, createdAt: true },
    }),
    prisma.task.findMany({
      where: { createdById: ownerId },
      select: { id: true, status: true },
    }),
  ])

  // --- Сводные карточки ---
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

  // --- Статус платежей ---
  const paymentStatus = {
    PAID: payments.filter((p) => p.status === 'PAID').length,
    PENDING: payments.filter((p) => p.status === 'PENDING').length,
    OVERDUE: payments.filter((p) => p.status === 'OVERDUE').length,
  }

  // --- Расходы по категориям ---
  const expenseByCategory: Record<string, number> = {}
  expenses.forEach((e) => {
    expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + Number(e.amount)
  })

  // --- Доход по объектам ---
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

  // --- Тренд по месяцам (последние 6) ---
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

  // --- Задачи ---
  const taskStatus = {
    TODO: tasks.filter((t) => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    DONE: tasks.filter((t) => t.status === 'DONE').length,
  }

  // --- Тикеты ---
  const ticketStatus = {
    OPEN: tickets.filter((t) => t.status === 'OPEN').length,
    IN_PROGRESS: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    RESOLVED: tickets.filter((t) => t.status === 'RESOLVED').length,
    CLOSED: tickets.filter((t) => t.status === 'CLOSED').length,
  }

  return NextResponse.json({
    summary: {
      totalProperties,
      rentedProperties,
      availableProperties,
      occupancyRate,
      totalPaid,
      totalPending,
      totalOverdue,
      totalExpenses,
      netProfit,
    },
    paymentStatus,
    expenseByCategory,
    revenueByProperty,
    monthlyTrend,
    taskStatus,
    ticketStatus,
  })
}
