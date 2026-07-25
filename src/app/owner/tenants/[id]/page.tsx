import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

/** Детальная страница арендатора для собственника — вся информация об арендаторе и его аренде. */
export default async function OwnerTenantDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'OWNER') {
    redirect('/tenant')
  }

  const tenant = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
    },
  })

  if (!tenant) {
    redirect('/owner/tenants')
  }

  const rentedProperties = await prisma.property.findMany({
    where: {
      ownerId: session.user.id,
      tenantId: tenant.id,
      status: 'RENTED',
    },
    include: {
      rentalRequests: {
        where: { tenantId: tenant.id },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { rentStart: 'desc' },
  })

  const allRequests = await prisma.rentalRequest.findMany({
    where: { tenantId: tenant.id },
    include: {
      property: {
        select: { id: true, title: true, address: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const ownerRequests = allRequests.filter((r) => r.property.id && rentedProperties.some((p) => p.id === r.propertyId) || r.property)

  const totalIncome = rentedProperties.reduce((sum, p) => sum + Number(p.rentPrice), 0)

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-4">
          <Link href="/owner/tenants">
            <Button variant="ghost" size="sm">← Назад</Button>
          </Link>
          <h1 className="text-xl font-bold">{tenant.name}</h1>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Контактная информация</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Имя: </span>
                <span className="font-medium">{tenant.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email: </span>
                <span>{tenant.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Телефон: </span>
                <span>{tenant.phone || 'Не указан'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Дата регистрации: </span>
                <span>{new Date(tenant.createdAt).toLocaleDateString('ru-RU')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle>Текущая аренда</CardTitle>
              {rentedProperties.length > 0 && (
                <span className="text-sm font-medium text-muted-foreground">
                  {totalIncome.toLocaleString('ru-RU')} ₽/мес
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {rentedProperties.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет активной аренды</p>
            ) : (
              <div className="space-y-4">
                {rentedProperties.map((property) => (
                  <div key={property.id} className="rounded-lg border p-4">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Объект: </span>
                        <Link href={`/owner/properties/${property.id}`} className="font-medium text-primary hover:underline">
                          {property.title}
                        </Link>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Адрес: </span>
                        <span>{property.address}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Аренда: </span>
                        <span className="font-medium">{Number(property.rentPrice).toLocaleString('ru-RU')} ₽/мес</span>
                      </div>
                      {property.area && (
                        <div>
                          <span className="text-muted-foreground">Площадь: </span>
                          <span>{Number(property.area)} м²</span>
                        </div>
                      )}
                      {property.rooms && (
                        <div>
                          <span className="text-muted-foreground">Комнаты: </span>
                          <span>{property.rooms}</span>
                        </div>
                      )}
                      {property.rentStart && property.rentEnd && (
                        <div>
                          <span className="text-muted-foreground">Период: </span>
                          <span>
                            {new Date(property.rentStart).toLocaleDateString('ru-RU')} — {new Date(property.rentEnd).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>История заявок</CardTitle>
          </CardHeader>
          <CardContent>
            {ownerRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет заявок от этого арендатора</p>
            ) : (
              <div className="space-y-3">
                {ownerRequests.map((request) => {
                  const statusLabels: Record<string, string> = {
                    PENDING: 'На рассмотрении',
                    APPROVED: 'Одобрена',
                    REJECTED: 'Отклонена',
                  }
                  const statusStyles: Record<string, string> = {
                    PENDING: 'bg-yellow-100 text-yellow-800',
                    APPROVED: 'bg-green-100 text-green-800',
                    REJECTED: 'bg-red-100 text-red-800',
                  }
                  return (
                    <div key={request.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="text-sm">
                        <span className="font-medium">{request.property.title}</span>
                        <span className="ml-2 text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[request.status] || ''}`}>
                        {statusLabels[request.status] || request.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
