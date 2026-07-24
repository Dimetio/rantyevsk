import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

/** PATCH /api/termination-requests/[id] — подтвердить или отклонить расторжение. */
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
    const { status } = body

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Статус обязателен: APPROVED или REJECTED' },
        { status: 400 }
      )
    }

    const terminationRequest = await prisma.terminationRequest.findUnique({
      where: { id: params.id },
      include: { property: true },
    })

    if (!terminationRequest) {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 })
    }

    const isOwner = terminationRequest.property.ownerId === session.user.id
    const isTenant = terminationRequest.property.tenantId === session.user.id

    if (!isOwner && !isTenant) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    if (terminationRequest.initiatedById === session.user.id) {
      return NextResponse.json(
        { error: 'Нельзя подтвердить собственную заявку на расторжение' },
        { status: 400 }
      )
    }

    if (terminationRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Заявка уже обработана' },
        { status: 400 }
      )
    }

    const updated = await prisma.terminationRequest.update({
      where: { id: params.id },
      data: { status },
      include: {
        initiatedBy: {
          select: { id: true, name: true, email: true },
        },
        property: {
          select: { id: true, title: true, address: true },
        },
      },
    })

    if (status === 'APPROVED') {
      await prisma.property.update({
        where: { id: terminationRequest.propertyId },
        data: {
          tenantId: null,
          status: 'AVAILABLE',
          rentStart: null,
          rentEnd: null,
        },
      })

      await prisma.terminationRequest.updateMany({
        where: {
          propertyId: terminationRequest.propertyId,
          id: { not: params.id },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при обработке заявки на расторжение' },
      { status: 500 }
    )
  }
}
