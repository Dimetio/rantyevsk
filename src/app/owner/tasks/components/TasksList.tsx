'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button, Card, CardContent } from '@/components/ui'

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string | null
  createdAt: string
  createdBy: { id: string; name: string }
  assignedTo: { id: string; name: string } | null
  property: { id: string; title: string; address: string }
}

interface TasksListProps {
  tasks: Task[]
  userRole: string
}

const STATUS_LABELS: Record<string, string> = {
  TODO: 'К выполнению',
  IN_PROGRESS: 'В работе',
  DONE: 'Выполнено',
}

const STATUS_STYLES: Record<string, string> = {
  TODO: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  DONE: 'bg-green-100 text-green-800',
}

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Низкий',
  MEDIUM: 'Средний',
  HIGH: 'Высокий',
}

const PRIORITY_STYLES: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-red-100 text-red-800',
}

/** Список задач с возможностью смены статуса и удаления. */
export function TasksList({ tasks, userRole }: TasksListProps) {
  const [items, setItems] = useState(tasks)
  const [processing, setProcessing] = useState<string | null>(null)
  const router = useRouter()

  async function handleStatusChange(taskId: string, status: string) {
    setProcessing(taskId)

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Ошибка')
        return
      }

      setItems((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status } : t))
      )
      router.refresh()
    } catch {
      alert('Произошла ошибка')
    } finally {
      setProcessing(null)
    }
  }

  async function handleDelete(taskId: string) {
    if (!confirm('Удалить задачу?')) return

    setProcessing(taskId)

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Ошибка')
        return
      }

      setItems((prev) => prev.filter((t) => t.id !== taskId))
      router.refresh()
    } catch {
      alert('Произошла ошибка')
    } finally {
      setProcessing(null)
    }
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Нет задач</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((task) => (
        <Card key={task.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium">{task.title}</h3>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[task.status] || ''}`}>
                    {STATUS_LABELS[task.status] || task.status}
                  </span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${PRIORITY_STYLES[task.priority] || ''}`}>
                    {PRIORITY_LABELS[task.priority] || task.priority}
                  </span>
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                )}
                <div className="text-xs text-muted-foreground space-x-3">
                  <span>{task.property.title}</span>
                  {task.assignedTo && <span>→ {task.assignedTo.name}</span>}
                  {task.dueDate && <span>до {new Date(task.dueDate).toLocaleDateString('ru-RU')}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {task.status !== 'DONE' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(task.id, task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
                    disabled={processing === task.id}
                  >
                    {processing === task.id ? '...' : task.status === 'TODO' ? 'В работу' : 'Готово'}
                  </Button>
                )}
                {userRole === 'OWNER' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(task.id)}
                    disabled={processing === task.id}
                  >
                    Удалить
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
