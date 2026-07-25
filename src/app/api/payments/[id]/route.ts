import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { paymentActionSchema } from '@/validations'

/** PATCH /api/payments/[id] — обновить статус платежа. */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  try {
    const body = await request.json()

    const result = paymentActionSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { status } = result.data

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: { property: true },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Платёж не найден' }, { status: 404 })
    }

    const isOwner = payment.property.ownerId === session.user.id
    const isTenant = payment.tenantId === session.user.id

    if (!isOwner && !isTenant) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    if (payment.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Платёж уже обработан' },
        { status: 400 }
      )
    }

    const updated = await prisma.payment.update({
      where: { id: params.id },
      data: {
        status,
        paidDate: status === 'PAID' ? new Date() : null,
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

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при обновлении платежа' },
      { status: 500 }
    )
  }
}
