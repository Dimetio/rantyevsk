import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

import { Button } from '@/components/ui'
import { TicketMessages } from './components/TicketMessages'
import { TicketActions } from './components/TicketActions'

/** Страница детального просмотра заявки для арендатора. */
export default async function TenantTicketDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'TENANT') {
    redirect('/owner')
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      property: {
        select: { id: true, title: true, address: true },
      },
      messages: {
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!ticket) {
    redirect('/tenant/tickets')
  }

  if (ticket.createdById !== session.user.id) {
    redirect('/tenant/tickets')
  }

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-4">
          <Link href="/tenant/tickets">
            <Button variant="ghost" size="sm">← Назад</Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{ticket.title}</h1>
            <p className="text-sm text-muted-foreground">
              {ticket.property.title}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        <TicketActions
          ticketId={ticket.id}
          currentStatus={ticket.status}
          userRole="TENANT"
        />

        <TicketMessages
          ticketId={ticket.id}
          messages={ticket.messages.map((m) => ({
            ...m,
            createdAt: m.createdAt.toISOString(),
          }))}
          currentUserId={session.user.id}
        />
      </div>
    </main>
  )
}
