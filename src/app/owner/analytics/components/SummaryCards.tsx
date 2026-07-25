import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'

interface SummaryCardsProps {
  totalProperties: number
  rentedProperties: number
  availableProperties: number
  occupancyRate: number
  totalPaid: number
  totalPending: number
  totalOverdue: number
  totalExpenses: number
  netProfit: number
}

function formatRub(n: number): string {
  return n.toLocaleString('ru-RU') + ' ₽'
}

/** Сводные карточки аналитики. */
export function SummaryCards({
  totalProperties,
  rentedProperties,
  availableProperties,
  occupancyRate,
  totalPaid,
  totalPending,
  totalOverdue,
  totalExpenses,
  netProfit,
}: SummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>Объекты</CardDescription>
          <CardTitle className="text-2xl">{totalProperties}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Сдано: {rentedProperties} · Свободно: {availableProperties} · Загрузка: {occupancyRate}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Получено</CardDescription>
          <CardTitle className="text-2xl text-green-600">{formatRub(totalPaid)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Ожидается: {formatRub(totalPending)} · Просрочено: {formatRub(totalOverdue)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Расходы</CardDescription>
          <CardTitle className="text-2xl text-red-600">{formatRub(totalExpenses)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">За все время</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Чистая прибыль</CardDescription>
          <CardTitle className={`text-2xl ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatRub(netProfit)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Доход − Расходы</p>
        </CardContent>
      </Card>
    </div>
  )
}
