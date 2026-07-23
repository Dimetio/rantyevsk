import type { Metadata } from 'next'

import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Rantyevsk — Управление арендной недвижимостью',
  description: 'Цифровая платформа для собственников и арендаторов',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
