import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { expenseSchema } from '@/validations'

/** GET /api/expenses — получить расходы собственника. */
export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  if (session.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

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

  return NextResponse.json(expenses)
}

/** POST /api/expenses — создать расход. */
export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  if (session.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Только собственники могут создавать расходы' }, { status: 403 })
  }

  try {
    const body = await request.json()

    const result = expenseSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { propertyId, amount, category, description, date } = result.data

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    })

    if (!property) {
      return NextResponse.json({ error: 'Объект не найден' }, { status: 404 })
    }

    if (property.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    const expense = await prisma.expense.create({
      data: {
        propertyId,
        amount,
        category,
        description,
        date: date ? new Date(date) : new Date(),
      },
      include: {
        property: {
          select: { id: true, title: true, address: true },
        },
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при создании расхода' },
      { status: 500 }
    )
  }
}
