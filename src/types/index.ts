import type { Role, PropertyStatus, RequestStatus } from '@prisma/client'

/** Тип пользователя в сессии. */
export interface SessionUser {
  id: string
  email: string
  name: string
  role: Role
}

/** Тип объекта недвижимости. */
export interface Property {
  id: string
  title: string
  address: string
  description: string | null
  area: number | null
  rooms: number | null
  floor: number | null
  rentPrice: number
  status: PropertyStatus
  createdAt: Date
  updatedAt: Date
  ownerId: string
  tenantId: string | null
}

/** Тип заявки на аренду. */
export interface RentalRequest {
  id: string
  status: RequestStatus
  message: string | null
  createdAt: Date
  updatedAt: Date
  tenantId: string
  propertyId: string
}
