import Link from 'next/link'

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui'
import { SignOutButton } from '@/components/compound/SignOutButton'
import prisma from '@/lib/prisma'
import { checkExpiredRentals } from '@/utils'
import { RentalRequestsList } from './components/RentalRequestsList'
import { AvailableProperties } from './components/AvailableProperties'
import { RentedProperties } from './components/RentedProperties'
import { TerminationRequestsList } from './components/TerminationRequestsList'

/** Dashboard арендатора. */
export default async function TenantDashboard() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'TENANT') {
    redirect('/owner')
  }

  await checkExpiredRentals()

  const rentedProperties = await prisma.property.findMany({
    where: { tenantId: session.user.id },
    include: {
      owner: {
        select: { name: true, email: true },
      },
    },
  })

  const availableProperties = await prisma.property.findMany({
    where: { status: 'AVAILABLE' },
    orderBy: { createdAt: 'desc' },
  })

  const rentalRequests = await prisma.rentalRequest.findMany({
    where: {
      tenantId: session.user.id,
      status: 'PENDING',
    },
    include: {
      property: {
        select: { id: true, title: true, address: true, rentPrice: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const incomingTerminations = await prisma.terminationRequest.findMany({
    where: {
      property: { tenantId: session.user.id },
      status: 'PENDING',
      initiatedById: { not: session.user.id },
    },
    include: {
      initiatedBy: {
        select: { id: true, name: true, email: true },
      },
      property: {
        select: { id: true, title: true, address: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const serializedRentedProperties = rentedProperties.map((p) => ({
    ...p,
    rentPrice: Number(p.rentPrice),
    area: p.area ? Number(p.area) : null,
    rentStart: p.rentStart ? p.rentStart.toISOString() : null,
    rentEnd: p.rentEnd ? p.rentEnd.toISOString() : null,
  }))

  const serializedAvailableProperties = availableProperties.map((p) => ({
    ...p,
    rentPrice: Number(p.rentPrice),
    area: p.area ? Number(p.area) : null,
  }))

  const serializedRequests = rentalRequests.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    property: {
      ...r.property,
      rentPrice: Number(r.property.rentPrice),
    },
  }))

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">Rantyevsk</h1>
            <p className="text-sm text-muted-foreground">Личный кабинет арендатора</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/tenant/profile">
              <Button variant="ghost" size="sm">{session.user.name}</Button>
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        <div className="flex justify-end gap-2">
          <Link href="/tenant/tasks">
            <Button variant="outline">Мои задачи</Button>
          </Link>
          <Link href="/tenant/documents">
            <Button variant="outline">Документы</Button>
          </Link>
          <Link href="/tenant/tickets">
            <Button variant="outline">Мои заявки</Button>
          </Link>
          <Link href="/tenant/payments">
            <Button variant="outline">Мои платежи</Button>
          </Link>
        </div>

        <RentedProperties properties={serializedRentedProperties} />

        <TerminationRequestsList requests={incomingTerminations.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
          property: { ...r.property },
        }))} />

        <RentalRequestsList requests={serializedRequests} />

        <AvailableProperties
          properties={serializedAvailableProperties}
          existingRequestPropertyIds={rentalRequests
            .filter((r) => r.status === 'PENDING')
            .map((r) => r.propertyId)}
        />
      </div>
    </main>
  )
}
