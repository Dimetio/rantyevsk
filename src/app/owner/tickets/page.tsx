import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { SignOutButton } from '@/components/compound/SignOutButton'
import { TicketStatusBadge } from './components/TicketStatusBadge'

/** Список заявок собственника — все обращения от арендаторов. */
export default async function OwnerTicketsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'OWNER') {
    redirect('/tenant')
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      property: { ownerId: session.user.id },
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      property: {
        select: { id: true, title: true, address: true },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          author: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const openCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length

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
              <p className="text-sm text-muted-foreground">Заявки{openCount > 0 ? ` (${openCount} активных)` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{session.user.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {tickets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Нет заявок</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const lastMessage = ticket.messages[0]
              return (
                <Link key={ticket.id} href={`/owner/tickets/${ticket.id}`}>
                  <Card className="transition-colors hover:bg-accent/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{ticket.title}</h3>
                            <TicketStatusBadge status={ticket.status} />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {ticket.property.title} — {ticket.createdBy.name}
                          </p>
                          {lastMessage && (
                            <p className="text-sm text-muted-foreground truncate max-w-md">
                              {lastMessage.author.name}: {lastMessage.text}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(ticket.updatedAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
