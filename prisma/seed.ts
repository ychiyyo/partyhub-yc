import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@partypulse.app'
  const password = process.env.ADMIN_PASSWORD || 'changeme'

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email },
  })

  if (existingAdmin) {
    console.log(`Admin user ${email} already exists.`)
    return
  }

  // Hash password and create admin
  const passwordHash = await bcrypt.hash(password, 10)

  const admin = await prisma.admin.create({
    data: {
      email,
      passwordHash,
    },
  })

  console.log(`Created admin user: ${admin.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
