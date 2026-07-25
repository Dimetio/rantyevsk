import { z } from 'zod'

/**
 * Схема валидации для входа в систему.
 */
export const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
})

export type LoginInput = z.infer<typeof loginSchema>

/**
 * Схема валидации для регистрации.
 */
export const registerSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  role: z.enum(['OWNER', 'TENANT'], { required_error: 'Выберите роль' }),
})

export type RegisterInput = z.infer<typeof registerSchema>

/**
 * Схема валидации для объекта недвижимости.
 */
export const propertySchema = z.object({
  title: z.string().min(1, 'Введите название'),
  address: z.string().min(1, 'Введите адрес'),
  description: z.string().optional(),
  area: z.coerce.number().positive('Площадь должна быть положительной').optional(),
  rooms: z.coerce.number().int().positive('Количество комнат должно быть положительным').optional(),
  floor: z.coerce.number().int().optional(),
  rentPrice: z.coerce.number().positive('Стоимость аренды должна быть положительной'),
  status: z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE']).default('AVAILABLE'),
})

export type PropertyInput = z.infer<typeof propertySchema>

/**
 * Схема валидации для заявки на аренду.
 */
export const rentalRequestSchema = z.object({
  propertyId: z.string().min(1, 'ID объекта обязателен'),
  message: z.string().optional(),
})

export type RentalRequestInput = z.infer<typeof rentalRequestSchema>

/**
 * Схема валидации для ответа на заявку (одобрение/отклонение).
 */
export const rentalRequestActionSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'], { required_error: 'Выберите действие' }),
})

export type RentalRequestActionInput = z.infer<typeof rentalRequestActionSchema>

/**
 * Схема валидации для обновления профиля.
 */
export const profileSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string().optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>

/**
 * Схема валидации для платежа.
 */
export const paymentSchema = z.object({
  propertyId: z.string().min(1, 'ID объекта обязателен'),
  amount: z.coerce.number().positive('Сумма должна быть положительной'),
  dueDate: z.string().min(1, 'Дата обязательна'),
  message: z.string().optional(),
})

export type PaymentInput = z.infer<typeof paymentSchema>

/**
 * Схема валидации для обновления статуса платежа.
 */
export const paymentActionSchema = z.object({
  status: z.enum(['PAID', 'OVERDUE'], { required_error: 'Выберите действие' }),
})

export type PaymentActionInput = z.infer<typeof paymentActionSchema>

/**
 * Схема валидации для расхода.
 */
export const expenseSchema = z.object({
  propertyId: z.string().min(1, 'ID объекта обязателен'),
  amount: z.coerce.number().positive('Сумма должна быть положительной'),
  category: z.enum(['REPAIR', 'UTILITIES', 'MAINTENANCE', 'OTHER']).default('OTHER'),
  description: z.string().min(1, 'Описание обязательно'),
  date: z.string().optional(),
})

export type ExpenseInput = z.infer<typeof expenseSchema>

/**
 * Схема валидации для заявки (обращения).
 */
export const ticketSchema = z.object({
  title: z.string().min(1, 'Введите тему обращения'),
  propertyId: z.string().min(1, 'ID объекта обязателен'),
  message: z.string().min(1, 'Введите сообщение'),
})

export type TicketInput = z.infer<typeof ticketSchema>

/**
 * Схема валидации для сообщения в заявке.
 */
export const ticketMessageSchema = z.object({
  text: z.string().min(1, 'Введите сообщение'),
})

export type TicketMessageInput = z.infer<typeof ticketMessageSchema>

/**
 * Схема валидации для обновления статуса заявки.
 */
export const ticketActionSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'RESOLVED', 'CLOSED'], { required_error: 'Выберите статус' }),
})

export type TicketActionInput = z.infer<typeof ticketActionSchema>

/**
 * Схема валидации для задачи.
 */
export const taskSchema = z.object({
  title: z.string().min(1, 'Введите название задачи'),
  description: z.string().optional(),
  propertyId: z.string().min(1, 'ID объекта обязателен'),
  assignedToId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  dueDate: z.string().optional(),
})

export type TaskInput = z.infer<typeof taskSchema>

/**
 * Схема валидации для обновления статуса задачи.
 */
export const taskActionSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE'], { required_error: 'Выберите статус' }),
})

export type TaskActionInput = z.infer<typeof taskActionSchema>

/**
 * Схема валидации для документа.
 */
export const documentSchema = z.object({
  title: z.string().min(1, 'Введите название документа'),
  type: z.enum(['CONTRACT', 'ACT', 'RECEIPT', 'OTHER']).default('OTHER'),
  propertyId: z.string().min(1, 'ID объекта обязателен'),
  fileUrl: z.string().min(1, 'URL файла обязателен'),
  fileName: z.string().min(1, 'Имя файла обязательно'),
  fileSize: z.number().optional(),
})

export type DocumentInput = z.infer<typeof documentSchema>
