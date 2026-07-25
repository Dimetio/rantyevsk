import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { paymentSchema } from '@/validations'

/** GET /api/payments — получить платежи. Owner: все по объектам, Tenant: свои. */
export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  if (session.user.role === 'OWNER') {
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

    return NextResponse.json(payments)
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

  return NextResponse.json(payments)
}

/** POST /api/payments — создать платёж (owner создаёт для арендатора). */
export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  if (session.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Только собственники могут создавать платежи' }, { status: 403 })
  }

  try {
    const body = await request.json()

    const result = paymentSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { propertyId, amount, dueDate, message } = result.data

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    })

    if (!property) {
      return NextResponse.json({ error: 'Объект не найден' }, { status: 404 })
    }

    if (property.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    if (!property.tenantId) {
      return NextResponse.json(
        { error: 'Нет арендатора для этого объекта' },
        { status: 400 }
      )
    }

    const payment = await prisma.payment.create({
      data: {
        propertyId,
        tenantId: property.tenantId,
        amount,
        dueDate: new Date(dueDate),
        message: message || null,
      },
      include: {
        tenant: {
          select: { id: true, name: true, email: true },
        },
        property: {
          select: { id: true, title: true, address: true },
        },
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при создании платежа' },
      { status: 500 }
    )
  }
}
