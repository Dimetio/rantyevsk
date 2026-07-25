import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

import { Button } from '@/components/ui'
import { SignOutButton } from '@/components/compound/SignOutButton'
import { TasksList } from './components/TasksList'

/** Страница задач арендатора — назначенные и созданные. */
export default async function TenantTasksPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'TENANT') {
    redirect('/owner')
  }

  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { assignedToId: session.user.id },
        { createdById: session.user.id },
      ],
    },
    include: {
      createdBy: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
      property: { select: { id: true, title: true, address: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const todoCount = tasks.filter((t) => t.status === 'TODO' || t.status === 'IN_PROGRESS').length

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/tenant">
              <Button variant="ghost" size="sm">← Назад</Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Rantyevsk</h1>
              <p className="text-sm text-muted-foreground">Мои задачи{todoCount > 0 ? ` (${todoCount} активных)` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{session.user.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <TasksList
          tasks={tasks.map((t) => ({
            ...t,
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
            dueDate: t.dueDate?.toISOString() ?? null,
          }))}
          userRole="TENANT"
        />
      </div>
    </main>
  )
}
