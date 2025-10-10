import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma Client untuk PostgreSQL (Supabase)
export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?connection_limit=10&pool_timeout=20&prepare=false"
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Helper function to test database connection
export const testDatabaseConnection = async () => {
  try {
    // Test Prisma connection
    await db.$connect()
    console.log('✅ Prisma connection successful')
    return true
  } catch (error) {
    console.log('❌ Database connection failed:', (error as Error).message)
    return false
  }
}