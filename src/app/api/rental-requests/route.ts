import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

/** GET /api/rental-requests — получить заявки. Owner: входящие, Tenant: исходящие. */
export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  if (session.user.role === 'OWNER') {
    const requests = await prisma.rentalRequest.findMany({
      where: {
        property: { ownerId: session.user.id },
      },
      include: {
        tenant: {
          select: { id: true, name: true, email: true },
        },
        property: {
          select: { id: true, title: true, address: true, rentPrice: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(requests)
  }

  const requests = await prisma.rentalRequest.findMany({
    where: { tenantId: session.user.id },
    include: {
      property: {
        select: { id: true, title: true, address: true, rentPrice: true, status: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(requests)
}

/** POST /api/rental-requests — арендатор отправляет заявку. */
export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  if (session.user.role !== 'TENANT') {
    return NextResponse.json({ error: 'Только арендаторы могут отправлять заявки' }, { status: 403 })
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

    if (property.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Объект недоступен для аренды' },
        { status: 400 }
      )
    }

    if (property.ownerId === session.user.id) {
      return NextResponse.json(
        { error: 'Нельзя арендовать собственный объект' },
        { status: 400 }
      )
    }

    const existingRequest = await prisma.rentalRequest.findUnique({
      where: {
        tenantId_propertyId: {
          tenantId: session.user.id,
          propertyId,
        },
      },
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Заявка на этот объект уже отправлена' },
        { status: 400 }
      )
    }

    const rentalRequest = await prisma.rentalRequest.create({
      data: {
        tenantId: session.user.id,
        propertyId,
        message: message || null,
      },
      include: {
        property: {
          select: { id: true, title: true, address: true, rentPrice: true },
        },
      },
    })

    return NextResponse.json(rentalRequest, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при создании заявки' },
      { status: 500 }
    )
  }
}
