import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

/** DELETE /api/documents/[id] — удалить документ (owner). */
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

  const document = await prisma.document.findUnique({
    where: { id: params.id },
    include: { property: true },
  })

  if (!document) {
    return NextResponse.json({ error: 'Документ не найден' }, { status: 404 })
  }

  if (document.property.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  await prisma.document.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}
