import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { SignOutButton } from '@/components/compound/SignOutButton'

/** Список арендаторов собственника — все текущие арендаторы с информацией об аренде. */
export default async function OwnerTenantsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'OWNER') {
    redirect('/tenant')
  }

  const rentedProperties = await prisma.property.findMany({
    where: {
      ownerId: session.user.id,
      status: 'RENTED',
      tenantId: { not: null },
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const tenants = rentedProperties
    .filter((p) => p.tenant)
    .map((p) => ({
      ...p,
      tenant: p.tenant!,
    }))

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
              <p className="text-sm text-muted-foreground">Мои арендаторы</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{session.user.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {tenants.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                У вас пока нет арендаторов
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {tenants.map((item) => (
              <Link key={item.tenant.id} href={`/owner/tenants/${item.tenant.id}`}>
                <Card className="transition-colors hover:bg-accent/50">
                  <CardHeader>
                    <CardTitle>{item.tenant.name}</CardTitle>
                    <CardDescription>{item.tenant.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Телефон: </span>
                        <span className="font-medium">{item.tenant.phone || 'Не указан'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Объект: </span>
                        <span className="font-medium">{item.title}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Адрес: </span>
                        <span>{item.address}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Аренда: </span>
                        <span className="font-medium">{Number(item.rentPrice).toLocaleString('ru-RU')} ₽/мес</span>
                      </div>
                      {item.rentStart && item.rentEnd && (
                        <div>
                          <span className="text-muted-foreground">Период: </span>
                          <span>
                            {new Date(item.rentStart).toLocaleDateString('ru-RU')} — {new Date(item.rentEnd).toLocaleDateString('ru-RU')}
                          </span>
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
