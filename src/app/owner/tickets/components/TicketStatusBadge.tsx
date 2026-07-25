const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Открыта',
  IN_PROGRESS: 'В работе',
  RESOLVED: 'Решена',
  CLOSED: 'Закрыта',
}

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
}

/** Бейдж статуса заявки. */
export function TicketStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] || ''}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}
