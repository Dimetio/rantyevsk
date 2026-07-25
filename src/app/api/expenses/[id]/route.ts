import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

/** DELETE /api/expenses/[id] — удалить расход. */
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

  const expense = await prisma.expense.findUnique({
    where: { id: params.id },
    include: { property: true },
  })

  if (!expense) {
    return NextResponse.json({ error: 'Расход не найден' }, { status: 404 })
  }

  if (expense.property.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  await prisma.expense.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}
