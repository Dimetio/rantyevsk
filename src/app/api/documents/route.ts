import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { documentSchema } from '@/validations'

/** GET /api/documents — получить документы. Owner: все по объектам, Tenant: по арендованным. */
export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  if (session.user.role === 'OWNER') {
    const documents = await prisma.document.findMany({
      where: {
        property: { ownerId: session.user.id },
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true },
        },
        property: {
          select: { id: true, title: true, address: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(documents)
  }

  const documents = await prisma.document.findMany({
    where: {
      property: {
        tenantId: session.user.id,
      },
    },
    include: {
      uploadedBy: {
        select: { id: true, name: true },
      },
      property: {
        select: { id: true, title: true, address: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(documents)
}

/** POST /api/documents — добавить документ (owner). */
export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  if (session.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Только собственники могут добавлять документы' }, { status: 403 })
  }

  try {
    const body = await request.json()

    const result = documentSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { title, type, propertyId, fileUrl, fileName, fileSize } = result.data

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    })

    if (!property) {
      return NextResponse.json({ error: 'Объект не найден' }, { status: 404 })
    }

    if (property.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    const document = await prisma.document.create({
      data: {
        title,
        type,
        propertyId,
        uploadedById: session.user.id,
        fileUrl,
        fileName,
        fileSize: fileSize || null,
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true },
        },
        property: {
          select: { id: true, title: true, address: true },
        },
      },
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при добавлении документа' },
      { status: 500 }
    )
  }
}
