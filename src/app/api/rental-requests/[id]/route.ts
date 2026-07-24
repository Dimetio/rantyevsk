import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

/** PATCH /api/rental-requests/[id] — owner одобряет или отклоняет заявку. */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  if (session.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Только собственники могут обрабатывать заявки' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { status } = body

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Статус обязателен: APPROVED или REJECTED' },
        { status: 400 }
      )
    }

    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: { id: params.id },
      include: {
        property: true,
      },
    })

    if (!rentalRequest) {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 })
    }

    if (rentalRequest.property.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    if (rentalRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Заявка уже обработана' },
        { status: 400 }
      )
    }

    const updated = await prisma.rentalRequest.update({
      where: { id: params.id },
      data: { status },
      include: {
        tenant: {
          select: { id: true, name: true, email: true },
        },
        property: {
          select: { id: true, title: true, address: true },
        },
      },
    })

    if (status === 'APPROVED') {
      await prisma.property.update({
        where: { id: rentalRequest.propertyId },
        data: {
          tenantId: rentalRequest.tenantId,
          status: 'RENTED',
        },
      })

      await prisma.rentalRequest.updateMany({
        where: {
          propertyId: rentalRequest.propertyId,
          id: { not: params.id },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при обработке заявки' },
      { status: 500 }
    )
  }
}
