import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface ExpenseChartProps {
  data: Record<string, number>
  total: number
}

const CATEGORY_LABELS: Record<string, string> = {
  REPAIR: 'Ремонт',
  UTILITIES: 'Коммунальные',
  MAINTENANCE: 'Обслуживание',
  OTHER: 'Прочее',
}

const CATEGORY_COLORS: Record<string, string> = {
  REPAIR: 'bg-orange-500',
  UTILITIES: 'bg-blue-500',
  MAINTENANCE: 'bg-purple-500',
  OTHER: 'bg-gray-400',
}

function formatRub(n: number): string {
  return n.toLocaleString('ru-RU') + ' ₽'
}

/** Горизонтальная полоса расходов по категориям. */
export function ExpenseChart({ data, total }: ExpenseChartProps) {
  const entries = Object.entries(data).filter(([, v]) => v > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Расходы по категориям</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Нет данных</p>
        ) : (
          <>
            <div className="flex h-4 overflow-hidden rounded-full">
              {entries.map(([cat, amount]) => {
                const pct = total > 0 ? (amount / total) * 100 : 0
                return (
                  <div
                    key={cat}
                    className={`${CATEGORY_COLORS[cat] || 'bg-gray-400'} transition-all`}
                    style={{ width: `${pct}%` }}
                    title={`${CATEGORY_LABELS[cat] || cat}: ${formatRub(amount)}`}
                  />
                )
              })}
            </div>
            <div className="space-y-2">
              {entries
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => (
                  <div key={cat} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${CATEGORY_COLORS[cat] || 'bg-gray-400'}`} />
                      <span>{CATEGORY_LABELS[cat] || cat}</span>
                    </div>
                    <span className="font-semibold">{formatRub(amount)}</span>
                  </div>
                ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
