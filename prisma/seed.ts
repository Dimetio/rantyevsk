import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/**
 * Заполнение БД тестовыми данными.
 * Создаёт двух пользователей (собственник + арендатор) и один объект.
 */
async function main() {
  console.log('Создание тестовых данных...')

  const passwordHash = await bcrypt.hash('password123', 12)

  const owner = await prisma.user.upsert({
    where: { email: 'owner@test.com' },
    update: {},
    create: {
      email: 'owner@test.com',
      name: 'Иван Петров',
      passwordHash,
      role: Role.OWNER,
    },
  })

  const tenant = await prisma.user.upsert({
    where: { email: 'tenant@test.com' },
    update: {},
    create: {
      email: 'tenant@test.com',
      name: 'Алексей Сидоров',
      passwordHash,
      role: Role.TENANT,
    },
  })

  const property = await prisma.property.upsert({
    where: { id: 'test-property-1' },
    update: {},
    create: {
      id: 'test-property-1',
      title: 'Квартира на Тверской',
      address: 'г. Москва, ул. Тверская, д. 10, кв. 25',
      description: 'Уютная двухкомнатная квартира в центре Москвы',
      area: 54.5,
      rooms: 2,
      floor: 5,
      rentPrice: 85000,
      status: 'RENTED',
      ownerId: owner.id,
      tenantId: tenant.id,
    },
  })

  console.log('Создано:')
  console.log(`  Собственник: ${owner.email} / password123`)
  console.log(`  Арендатор:   ${tenant.email} / password123`)
  console.log(`  Объект:      ${property.title} (${property.address})`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
