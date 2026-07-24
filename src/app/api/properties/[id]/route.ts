import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

/** GET /api/properties/[id] — получить объект по ID. */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      tenant: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  if (!property) {
    return NextResponse.json({ error: 'Объект не найден' }, { status: 404 })
  }

  const isOwner = property.ownerId === session.user.id
  const isTenant = property.tenantId === session.user.id

  let hasRequest = false
  if (!isOwner && !isTenant) {
    const request = await prisma.rentalRequest.findUnique({
      where: {
        tenantId_propertyId: {
          tenantId: session.user.id,
          propertyId: params.id,
        },
      },
    })
    hasRequest = !!request
  }

  if (!isOwner && !isTenant && !hasRequest) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  return NextResponse.json(property)
}

/** PUT /api/properties/[id] — обновить объект. */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const property = await prisma.property.findUnique({
    where: { id: params.id },
  })

  if (!property) {
    return NextResponse.json({ error: 'Объект не найден' }, { status: 404 })
  }

  if (property.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Только собственник может редактировать объект' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { title, address, description, area, rooms, floor, rentPrice, status } = body

    const updated = await prisma.property.update({
      where: { id: params.id },
      data: {
        title: title ?? property.title,
        address: address ?? property.address,
        description: description !== undefined ? description : property.description,
        area: area !== undefined ? (area ? parseFloat(area) : null) : property.area,
        rooms: rooms !== undefined ? (rooms ? parseInt(rooms) : null) : property.rooms,
        floor: floor !== undefined ? (floor ? parseInt(floor) : null) : property.floor,
        rentPrice: rentPrice ? parseFloat(rentPrice) : property.rentPrice,
        status: status ?? property.status,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при обновлении объекта' },
      { status: 500 }
    )
  }
}

/** DELETE /api/properties/[id] — удалить объект. */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const property = await prisma.property.findUnique({
    where: { id: params.id },
  })

  if (!property) {
    return NextResponse.json({ error: 'Объект не найден' }, { status: 404 })
  }

  if (property.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Только собственник может удалить объект' }, { status: 403 })
  }

  await prisma.property.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}
