import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

/** GET /api/properties — получить список объектов текущего собственника. */
export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const properties = await prisma.property.findMany({
    where: { ownerId: session.user.id },
    include: {
      tenant: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(properties)
}

/** POST /api/properties — создать новый объект недвижимости. */
export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  if (session.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Только собственники могут создавать объекты' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { title, address, description, area, rooms, floor, rentPrice, status } = body

    if (!title || !address || !rentPrice) {
      return NextResponse.json(
        { error: 'Название, адрес и стоимость аренды обязательны' },
        { status: 400 }
      )
    }

    const property = await prisma.property.create({
      data: {
        title,
        address,
        description: description || null,
        area: area ? parseFloat(area) : null,
        rooms: rooms ? parseInt(rooms) : null,
        floor: floor ? parseInt(floor) : null,
        rentPrice: parseFloat(rentPrice),
        status: status || 'AVAILABLE',
        ownerId: session.user.id,
      },
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при создании объекта' },
      { status: 500 }
    )
  }
}
