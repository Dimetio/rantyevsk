import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { taskActionSchema } from '@/validations'

/** PATCH /api/tasks/[id] — обновить статус задачи. */
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

    const result = taskActionSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { status } = result.data

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: { property: true },
    })

    if (!task) {
      return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 })
    }

    const isOwner = task.property.ownerId === session.user.id
    const isAssigned = task.assignedToId === session.user.id

    if (!isOwner && !isAssigned) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    const updated = await prisma.task.update({
      where: { id: params.id },
      data: { status },
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

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при обновлении задачи' },
      { status: 500 }
    )
  }
}

/** DELETE /api/tasks/[id] — удалить задачу (owner). */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  if (session.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: { property: true },
  })

  if (!task) {
    return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 })
  }

  if (task.property.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  await prisma.task.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}
