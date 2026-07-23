import Link from 'next/link'

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { SignOutButton } from '@/components/compound/SignOutButton'
import prisma from '@/lib/prisma'

/** Dashboard собственника — главная страница после входа. */
export default async function OwnerDashboard() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'OWNER') {
    redirect('/tenant')
  }

  const properties = await prisma.property.findMany({
    where: { ownerId: session.user.id },
    include: {
      tenant: {
        select: { name: true },
      },
    },
  })

  const totalProperties = properties.length
  const rentedProperties = properties.filter((p) => p.status === 'RENTED').length
  const totalIncome = properties
    .filter((p) => p.status === 'RENTED')
    .reduce((sum, p) => sum + Number(p.rentPrice), 0)

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">Rantyevsk</h1>
            <p className="text-sm text-muted-foreground">Портал собственника</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{session.user.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Мои объекты</h2>
          <Link href="/owner/properties/new">
            <Button>+ Добавить объект</Button>
          </Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Всего объектов</CardDescription>
              <CardTitle className="text-2xl">{totalProperties}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Сдано в аренду</CardDescription>
              <CardTitle className="text-2xl">{rentedProperties}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Доход в месяц</CardDescription>
              <CardTitle className="text-2xl">{totalIncome.toLocaleString('ru-RU')} ₽</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {properties.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">У вас пока нет объектов недвижимости</p>
              <Link href="/owner/properties/new">
                <Button>Добавить первый объект</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {properties.map((property) => (
              <Link key={property.id} href={`/owner/properties/${property.id}`}>
                <Card className="transition-colors hover:bg-accent/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{property.title}</CardTitle>
                        <CardDescription>{property.address}</CardDescription>
                      </div>
                      <StatusBadge status={property.status} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Аренда: </span>
                        <span className="font-medium">{Number(property.rentPrice ?? 0).toLocaleString('ru-RU')} ₽</span>
                      </div>
                      {property.area && (
                        <div>
                          <span className="text-muted-foreground">Площадь: </span>
                          <span className="font-medium">{Number(property.area ?? 0)} м²</span>
                        </div>
                      )}
                      {property.rooms && (
                        <div>
                          <span className="text-muted-foreground">Комнаты: </span>
                          <span className="font-medium">{property.rooms}</span>
                        </div>
                      )}
                      {property.tenant && (
                        <div>
                          <span className="text-muted-foreground">Арендатор: </span>
                          <span className="font-medium">{property.tenant.name}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-800',
    RENTED: 'bg-blue-100 text-blue-800',
    MAINTENANCE: 'bg-yellow-100 text-yellow-800',
  }
  const labels: Record<string, string> = {
    AVAILABLE: 'Свободен',
    RENTED: 'Сдан',
    MAINTENANCE: 'Обслуживание',
  }
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] || ''}`}>
      {labels[status] || status}
    </span>
  )
}
