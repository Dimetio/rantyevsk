import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { taskSchema } from '@/validations'

/** GET /api/tasks — получить задачи. Owner: все по объектам, Tenant: назначенные. */
export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  if (session.user.role === 'OWNER') {
    const tasks = await prisma.task.findMany({
      where: {
        property: { ownerId: session.user.id },
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
        assignedTo: {
          select: { id: true, name: true },
        },
        property: {
          select: { id: true, title: true, address: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(tasks)
  }

  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { assignedToId: session.user.id },
        { createdById: session.user.id },
      ],
    },
    include: {
      createdBy: {
        select: { id: true, name: true },
      },
      assignedTo: {
        select: { id: true, name: true },
      },
      property: {
        select: { id: true, title: true, address: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(tasks)
}

/** POST /api/tasks — создать задачу (owner). */
export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  if (session.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Только собственники могут создавать задачи' }, { status: 403 })
  }

  try {
    const body = await request.json()

    const result = taskSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { title, description, propertyId, assignedToId, priority, dueDate } = result.data

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    })

    if (!property) {
      return NextResponse.json({ error: 'Объект не найден' }, { status: 404 })
    }

    if (property.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    if (assignedToId && assignedToId !== property.tenantId) {
      return NextResponse.json(
        { error: 'Назначить можно только арендатора этого объекта' },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        propertyId,
        createdById: session.user.id,
        assignedToId: assignedToId || property.tenantId || null,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
        assignedTo: {
          select: { id: true, name: true },
        },
        property: {
          select: { id: true, title: true, address: true },
        },
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при создании задачи' },
      { status: 500 }
    )
  }
}
