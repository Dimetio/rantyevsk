import prisma from '@/lib/prisma'

/**
 * Проверяет и автоматически завершает аренду для объектов с истёкшим сроком.
 * Вызывается при обращении к dashboard.
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

  for (const property of expiredProperties) {
    await prisma.property.update({
      where: { id: property.id },
      data: {
        tenantId: null,
        status: 'AVAILABLE',
        rentStart: null,
        rentEnd: null,
      },
    })

    await prisma.terminationRequest.updateMany({
      where: {
        propertyId: property.id,
        status: 'PENDING',
      },
      data: { status: 'APPROVED' },
    })
  }

  return expiredProperties.length
}
