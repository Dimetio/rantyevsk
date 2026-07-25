import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ticketActionSchema } from '@/validations'

/** PATCH /api/tickets/[id] — обновить статус заявки. */
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

    const result = ticketActionSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { status } = result.data

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: { property: true },
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 })
    }

    const isOwner = ticket.property.ownerId === session.user.id
    const isCreator = ticket.createdById === session.user.id

    if (!isOwner && !isCreator) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    const updated = await prisma.ticket.update({
      where: { id: params.id },
      data: { status },
      include: {
        createdBy: {
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
      { error: 'Ошибка при обновлении заявки' },
      { status: 500 }
    )
  }
}
