import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface PaymentChartProps {
  data: { PAID: number; PENDING: number; OVERDUE: number }
  total: number
}

const SEGMENTS = [
  { key: 'PAID', label: 'Оплачено', color: 'bg-green-500' },
  { key: 'PENDING', label: 'Ожидается', color: 'bg-yellow-500' },
  { key: 'OVERDUE', label: 'Просрочено', color: 'bg-red-500' },
] as const

/** Горизонтальная полоса статусов платежей. */
export function PaymentChart({ data, total }: PaymentChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Статус платежей</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">Нет данных</p>
        ) : (
          <>
            <div className="flex h-4 overflow-hidden rounded-full">
              {SEGMENTS.map((seg) => {
                const count = data[seg.key]
                const pct = total > 0 ? (count / total) * 100 : 0
                if (pct === 0) return null
                return (
                  <div
                    key={seg.key}
                    className={`${seg.color} transition-all`}
                    style={{ width: `${pct}%` }}
                    title={`${seg.label}: ${count}`}
                  />
                )
              })}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {SEGMENTS.map((seg) => (
                <div key={seg.key} className="space-y-1">
                  <div className={`mx-auto h-2 w-2 rounded-full ${seg.color}`} />
                  <p className="text-muted-foreground">{seg.label}</p>
                  <p className="font-semibold">{data[seg.key]}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
