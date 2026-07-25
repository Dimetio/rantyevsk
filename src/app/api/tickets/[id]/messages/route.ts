import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ticketMessageSchema } from '@/validations'

/** POST /api/tickets/[id]/messages — отправить сообщение в заявке. */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  try {
    const body = await request.json()

    const result = ticketMessageSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { text } = result.data

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

    if (ticket.status === 'CLOSED') {
      return NextResponse.json(
        { error: 'Заявка закрыта. Откройте новую заявку.' },
        { status: 400 }
      )
    }

    const message = await prisma.ticketMessage.create({
      data: {
        text,
        ticketId: params.id,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    await prisma.ticket.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при отправке сообщения' },
      { status: 500 }
    )
  }
}
