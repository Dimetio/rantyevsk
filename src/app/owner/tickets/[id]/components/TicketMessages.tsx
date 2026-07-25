'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button, Card, CardContent, Input } from '@/components/ui'

interface Message {
  id: string
  text: string
  createdAt: string
  author: { id: string; name: string; email: string }
}

interface TicketMessagesProps {
  ticketId: string
  messages: Message[]
  currentUserId: string
}

/** Компонент отображения и отправки сообщений в заявке. */
export function TicketMessages({ ticketId, messages, currentUserId }: TicketMessagesProps) {
  const [items, setItems] = useState(messages)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const router = useRouter()

  async function handleSend() {
    if (!newMessage.trim()) return

    setSending(true)

    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newMessage.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Ошибка')
        return
      }

      const message = await res.json()
      setItems((prev) => [...prev, {
        ...message,
        createdAt: message.createdAt,
      }])
      setNewMessage('')
      router.refresh()
    } catch {
      alert('Произошла ошибка')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Сообщения ({items.length})</h3>

      <div className="space-y-3">
        {items.map((message) => {
          const isOwn = message.author.id === currentUserId
          return (
            <Card key={message.id}>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {isOwn ? 'Вы' : message.author.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.createdAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Введите сообщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            <Button
              onClick={handleSend}
              disabled={sending || !newMessage.trim()}
            >
              {sending ? '...' : 'Отправить'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
