'use client'

import { useState } from 'react'

import { Button, Card, CardContent } from '@/components/ui'

interface Document {
  id: string
  title: string
  type: string
  fileUrl: string
  fileName: string
  fileSize: number | null
  createdAt: string
  uploadedBy: { id: string; name: string }
  property: { id: string; title: string; address: string }
}

interface DocumentsListProps {
  documents: Document[]
  userRole: string
}

const TYPE_LABELS: Record<string, string> = {
  CONTRACT: 'Договор',
  ACT: 'Акт',
  RECEIPT: 'Квитанция',
  OTHER: 'Прочее',
}

const TYPE_STYLES: Record<string, string> = {
  CONTRACT: 'bg-blue-100 text-blue-800',
  ACT: 'bg-green-100 text-green-800',
  RECEIPT: 'bg-yellow-100 text-yellow-800',
  OTHER: 'bg-gray-100 text-gray-800',
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

/** Список документов для арендатора. */
export function DocumentsList({ documents, userRole }: DocumentsListProps) {
  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Нет документов</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <Card key={doc.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{doc.title}</h3>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_STYLES[doc.type] || ''}`}>
                    {TYPE_LABELS[doc.type] || doc.type}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground space-x-3">
                  <span>{doc.property.title}</span>
                  <span>{doc.fileName}</span>
                  {doc.fileSize && <span>{formatFileSize(doc.fileSize)}</span>}
                  <span>{new Date(doc.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline">Открыть</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
