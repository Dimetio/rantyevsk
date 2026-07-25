import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ticketSchema } from '@/validations'

/** GET /api/tickets — получить заявки. Owner: все по объектам, Tenant: свои. */
export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  if (session.user.role === 'OWNER') {
    const tickets = await prisma.ticket.findMany({
      where: {
        property: { ownerId: session.user.id },
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        property: {
          select: { id: true, title: true, address: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            author: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(tickets)
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      createdById: session.user.id,
    },
    include: {
      property: {
        select: { id: true, title: true, address: true },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          author: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(tickets)
}

/** POST /api/tickets — создать заявку. */
export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  try {
    const body = await request.json()

    const result = ticketSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { title, propertyId, message } = result.data

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    })

    if (!property) {
      return NextResponse.json({ error: 'Объект не найден' }, { status: 404 })
    }

    if (session.user.role === 'TENANT' && property.tenantId !== session.user.id) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    if (session.user.role === 'OWNER' && property.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        createdById: session.user.id,
        propertyId,
        messages: {
          create: {
            text: message,
            authorId: session.user.id,
          },
        },
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        property: {
          select: { id: true, title: true, address: true },
        },
      },
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при создании заявки' },
      { status: 500 }
    )
  }
}
