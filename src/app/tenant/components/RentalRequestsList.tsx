import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'

interface Request {
  id: string
  status: string
  message: string | null
  createdAt: Date
  property: {
    id: string
    title: string
    address: string
    rentPrice: number
  }
}

interface RentalRequestsListProps {
  requests: Request[]
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'На рассмотрении',
  APPROVED: 'Одобрена',
  REJECTED: 'Отклонена',
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
}

/** Список заявок арендатора. */
export function RentalRequestsList({ requests }: RentalRequestsListProps) {
  if (requests.length === 0) {
    return null
  }

  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold">Мои заявки</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{request.property.title}</CardTitle>
                  <CardDescription>{request.property.address}</CardDescription>
                </div>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[request.status] || ''}`}>
                  {STATUS_LABELS[request.status] || request.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-muted-foreground">Аренда: </span>
                  <span className="font-medium">{Number(request.property.rentPrice).toLocaleString('ru-RU')} ₽/мес</span>
                </div>
                {request.message && (
                  <div>
                    <span className="text-muted-foreground">Комментарий: </span>
                    <span>{request.message}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Дата заявки: </span>
                  <span>{new Date(request.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
