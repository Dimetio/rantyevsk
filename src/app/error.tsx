'use client'

/** Обработчик ошибок корневого layout. */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-4 text-xl font-bold">Произошла ошибка</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {error.message || 'Что-то пошло не так'}
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  )
}
