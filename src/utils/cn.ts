import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Объединяет классы Tailwind CSS с поддержкой условных классов.
 * @param inputs - Список классов для объединения
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
