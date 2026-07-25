import prisma from '@/lib/prisma'

/**
 * Проверяет и автоматически завершает аренду для объектов с истёкшим сроком.
 * Вызывается при обращении к dashboard.
 * Использует атомарные операции для защиты от race condition.
 */
export async function checkExpiredRentals() {
  const expiredProperties = await prisma.property.findMany({
    where: {
      status: 'RENTED',
      rentEnd: {
        lt: new Date(),
      },
    },
  })

  if (expiredProperties.length === 0) return 0

  const expiredIds = expiredProperties.map((p) => p.id)

  await prisma.$transaction([
    prisma.property.updateMany({
      where: {
        id: { in: expiredIds },
        status: 'RENTED',
      },
      data: {
        tenantId: null,
        status: 'AVAILABLE',
        rentStart: null,
        rentEnd: null,
      },
    }),
    prisma.terminationRequest.updateMany({
      where: {
        propertyId: { in: expiredIds },
        status: 'PENDING',
      },
      data: { status: 'APPROVED' },
    }),
  ])

  return expiredIds.length
}
