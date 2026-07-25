import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

import { Button } from '@/components/ui'
import { SignOutButton } from '@/components/compound/SignOutButton'
import { DocumentsList } from './components/DocumentsList'
import { CreateDocumentForm } from './components/CreateDocumentForm'

/** Страница документов собственника. */
export default async function OwnerDocumentsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'OWNER') {
    redirect('/tenant')
  }

  const documents = await prisma.document.findMany({
    where: {
      property: { ownerId: session.user.id },
    },
    include: {
      uploadedBy: { select: { id: true, name: true } },
      property: { select: { id: true, title: true, address: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const properties = await prisma.property.findMany({
    where: { ownerId: session.user.id },
    select: { id: true, title: true },
  })

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
              <p className="text-sm text-muted-foreground">Документы</p>
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
          <CreateDocumentForm properties={properties} />
        </div>

        <DocumentsList
          documents={documents.map((d) => ({
            ...d,
            createdAt: d.createdAt.toISOString(),
          }))}
          userRole="OWNER"
        />
      </div>
    </main>
  )
}
