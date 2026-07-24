import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

/** GET /api/termination-requests — получить заявки на расторжение. */
export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const requests = await prisma.terminationRequest.findMany({
    where: {
      property: {
        OR: [
          { ownerId: session.user.id },
          { tenantId: session.user.id },
        ],
      },
    },
    include: {
      initiatedBy: {
        select: { id: true, name: true, email: true },
      },
      property: {
        select: { id: true, title: true, address: true, ownerId: true, tenantId: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(requests)
}

/** POST /api/termination-requests — инициировать расторжение аренды. */
export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { propertyId, message } = body

    if (!propertyId) {
      return NextResponse.json(
        { error: 'ID объекта обязателен' },
        { status: 400 }
      )
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    })

    if (!property) {
      return NextResponse.json({ error: 'Объект не найден' }, { status: 404 })
    }

    if (property.status !== 'RENTED') {
      return NextResponse.json(
        { error: 'Расторжение возможно только для арендованных объектов' },
        { status: 400 }
      )
    }

    const isOwner = property.ownerId === session.user.id
    const isTenant = property.tenantId === session.user.id

    if (!isOwner && !isTenant) {
      return NextResponse.json(
        { error: 'Только собственник или арендатор могут инициировать расторжение' },
        { status: 403 }
      )
    }

    const existingRequest = await prisma.terminationRequest.findFirst({
      where: {
        propertyId,
        status: 'PENDING',
      },
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Заявка на расторжение уже существует' },
        { status: 400 }
      )
    }

    const terminationRequest = await prisma.terminationRequest.create({
      data: {
        initiatedById: session.user.id,
        propertyId,
        message: message || null,
      },
      include: {
        property: {
          select: { id: true, title: true, address: true },
        },
      },
    })

    return NextResponse.json(terminationRequest, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при создании заявки на расторжение' },
      { status: 500 }
    )
  }
}
