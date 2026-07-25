import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface ActivityStatsProps {
  title: string
  statuses: Array<{
    label: string
    count: number
    color: string
  }>
}

/** Статистика по статусам задач/тикетов. */
export function ActivityStats({ title, statuses }: ActivityStatsProps) {
  const total = statuses.reduce((s, st) => s + st.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">Нет данных</p>
        ) : (
          <>
            <div className="flex h-3 overflow-hidden rounded-full">
              {statuses.map((st) => {
                if (st.count === 0) return null
                const pct = (st.count / total) * 100
                return (
                  <div
                    key={st.label}
                    className={`${st.color} transition-all`}
                    style={{ width: `${pct}%` }}
                    title={`${st.label}: ${st.count}`}
                  />
                )
              })}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              {statuses.map((st) => (
                <div key={st.label} className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${st.color}`} />
                  <span className="text-muted-foreground">{st.label}</span>
                  <span className="font-semibold">{st.count}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
