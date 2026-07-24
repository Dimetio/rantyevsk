import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { SignOutButton } from '@/components/compound/SignOutButton'
import prisma from '@/lib/prisma'
import { RentalRequestsList } from './components/RentalRequestsList'
import { AvailableProperties } from './components/AvailableProperties'

/** Dashboard арендатора. */
export default async function TenantDashboard() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'TENANT') {
    redirect('/owner')
  }

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
    where: { tenantId: session.user.id },
    include: {
      property: {
        select: { id: true, title: true, address: true, rentPrice: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const serializedRentedProperties = rentedProperties.map((p) => ({
    ...p,
    rentPrice: Number(p.rentPrice),
    area: p.area ? Number(p.area) : null,
  }))

  const serializedAvailableProperties = availableProperties.map((p) => ({
    ...p,
    rentPrice: Number(p.rentPrice),
    area: p.area ? Number(p.area) : null,
  }))

  const serializedRequests = rentalRequests.map((r) => ({
    ...r,
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
            <span className="text-sm">{session.user.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        <section>
          <h2 className="mb-4 text-2xl font-bold">Мои квартиры</h2>
          {serializedRentedProperties.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  У вас пока нет арендованных квартир
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {serializedRentedProperties.map((property) => (
                <Card key={property.id}>
                  <CardHeader>
                    <CardTitle>{property.title}</CardTitle>
                    <CardDescription>{property.address}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Аренда: </span>
                        <span className="font-medium">{property.rentPrice.toLocaleString('ru-RU')} ₽/мес</span>
                      </div>
                      {property.area && (
                        <div>
                          <span className="text-muted-foreground">Площадь: </span>
                          <span className="font-medium">{property.area} м²</span>
                        </div>
                      )}
                      {property.rooms && (
                        <div>
                          <span className="text-muted-foreground">Комнаты: </span>
                          <span className="font-medium">{property.rooms}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Собственник: </span>
                        <span className="font-medium">{property.owner.name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <RentalRequestsList requests={serializedRequests} />

        <AvailableProperties
          properties={serializedAvailableProperties}
          existingRequestPropertyIds={rentalRequests.map((r) => r.propertyId)}
        />
      </div>
    </main>
  )
}
