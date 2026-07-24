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
