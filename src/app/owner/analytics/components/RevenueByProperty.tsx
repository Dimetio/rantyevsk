import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface RevenueByPropertyProps {
  data: Array<{
    id: string
    title: string
    rentPrice: number
    paid: number
    expenses: number
    net: number
  }>
}

function formatRub(n: number): string {
  return n.toLocaleString('ru-RU') + ' ₽'
}

/** Таблица доходности по объектам. */
export function RevenueByProperty({ data }: RevenueByPropertyProps) {
  const maxPaid = Math.max(...data.map((d) => d.paid), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Доходность по объектам</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Нет данных</p>
        ) : (
          <div className="space-y-4">
            {data.map((prop) => (
              <div key={prop.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{prop.title}</span>
                  <span className={prop.net >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatRub(prop.net)}
                  </span>
                </div>
                <div className="relative h-6 overflow-hidden rounded bg-muted">
                  <div
                    className="absolute inset-y-0 left-0 bg-green-500/70"
                    style={{ width: `${maxPaid > 0 ? (prop.paid / maxPaid) * 100 : 0}%` }}
                    title={`Оплачено: ${formatRub(prop.paid)}`}
                  />
                  {prop.expenses > 0 && (
                    <div
                      className="absolute inset-y-0 left-0 bg-red-500/70"
                      style={{ width: `${maxPaid > 0 ? (prop.expenses / maxPaid) * 100 : 0}%` }}
                      title={`Расходы: ${formatRub(prop.expenses)}`}
                    />
                  )}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Аренда: {formatRub(prop.rentPrice)}</span>
                  <span>Получено: {formatRub(prop.paid)}</span>
                  <span>Расходы: {formatRub(prop.expenses)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
