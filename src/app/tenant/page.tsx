import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { SignOutButton } from '@/components/compound/SignOutButton'
import prisma from '@/lib/prisma'

/** Dashboard арендатора. */
export default async function TenantDashboard() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'TENANT') {
    redirect('/owner')
  }

  const property = await prisma.property.findFirst({
    where: { tenantId: session.user.id },
    include: {
      owner: {
        select: { name: true, email: true },
      },
    },
  })

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

      <div className="mx-auto max-w-7xl px-6 py-8">
        <h2 className="mb-6 text-2xl font-bold">Моя квартира</h2>

        {!property ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Вы пока не привязаны к объекту недвижимости.
                <br />
                Собственник назначит вас арендатором к квартире.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{property.title}</CardTitle>
              <CardDescription>{property.address}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Аренда: </span>
                  <span className="font-medium">{Number(property.rentPrice ?? 0).toLocaleString('ru-RU')} ₽/мес</span>
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
                <div>
                  <span className="text-muted-foreground">Собственник: </span>
                  <span className="font-medium">{property.owner.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
