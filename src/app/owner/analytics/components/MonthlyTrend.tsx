import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface MonthlyTrendProps {
  data: Array<{
    label: string
    income: number
    expenses: number
  }>
}

function formatRub(n: number): string {
  return n.toLocaleString('ru-RU') + ' ₽'
}

/** Столбчатая диаграмма доходов и расходов по месяцам. */
export function MonthlyTrend({ data }: MonthlyTrendProps) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expenses)), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Динамика за 6 месяцев</CardTitle>
      </CardHeader>
      <CardContent>
        {data.every((d) => d.income === 0 && d.expenses === 0) ? (
          <p className="text-sm text-muted-foreground">Нет данных</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-2" style={{ height: 160 }}>
              {data.map((month, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full items-end justify-center gap-1" style={{ height: 140 }}>
                    <div
                      className="w-1/2 rounded-t bg-green-500/70"
                      style={{ height: `${maxVal > 0 ? (month.income / maxVal) * 100 : 0}%` }}
                      title={`Доход: ${formatRub(month.income)}`}
                    />
                    <div
                      className="w-1/2 rounded-t bg-red-500/70"
                      style={{ height: `${maxVal > 0 ? (month.expenses / maxVal) * 100 : 0}%` }}
                      title={`Расходы: ${formatRub(month.expenses)}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              {data.map((month, i) => (
                <span key={i} className="flex-1 text-center">{month.label}</span>
              ))}
            </div>
            <div className="flex justify-center gap-6 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-sm bg-green-500" />
                <span className="text-muted-foreground">Доход</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-sm bg-red-500" />
                <span className="text-muted-foreground">Расходы</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
