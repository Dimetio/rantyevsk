import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

import { Button, Card, CardContent } from '@/components/ui'
import { SignOutButton } from '@/components/compound/SignOutButton'
import { TasksList } from './components/TasksList'
import { CreateTaskForm } from './components/CreateTaskForm'

/** Страница задач собственника. */
export default async function OwnerTasksPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'OWNER') {
    redirect('/tenant')
  }

  const tasks = await prisma.task.findMany({
    where: {
      property: { ownerId: session.user.id },
    },
    include: {
      createdBy: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
      property: { select: { id: true, title: true, address: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const properties = await prisma.property.findMany({
    where: { ownerId: session.user.id },
    select: { id: true, title: true },
  })

  const tenants = await prisma.user.findMany({
    where: {
      rentedProperties: {
        some: { ownerId: session.user.id, status: 'RENTED' },
      },
    },
    select: { id: true, name: true },
  })

  const todoCount = tasks.filter((t) => t.status === 'TODO' || t.status === 'IN_PROGRESS').length

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/owner">
              <Button variant="ghost" size="sm">← Назад</Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Rantyevsk</h1>
              <p className="text-sm text-muted-foreground">Задачи{todoCount > 0 ? ` (${todoCount} активных)` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{session.user.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        <div className="flex justify-end">
          <CreateTaskForm properties={properties} tenants={tenants} />
        </div>

        <TasksList
          tasks={tasks.map((t) => ({
            ...t,
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
            dueDate: t.dueDate?.toISOString() ?? null,
          }))}
          userRole="OWNER"
        />
      </div>
    </main>
  )
}
