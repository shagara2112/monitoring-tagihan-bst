import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma Client untuk PostgreSQL (Supabase)
export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?pgbouncer=true"
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

// Wrapper function with retry logic for all Prisma queries
export const withRetry = async <T>(
  queryFn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 100
): Promise<T> => {
  let retryCount = 0
  
  while (retryCount < maxRetries) {
    try {
      return await queryFn()
    } catch (error: any) {
      retryCount++
      
      // Check if it's a prepared statement error
      if (
        error.code === '26000' ||
        (error.message && error.message.includes('prepared statement')) ||
        (error.message && error.message.includes('does not exist'))
      ) {
        // If it's the last retry, throw the error
        if (retryCount >= maxRetries) {
          throw error
        }
        
        // Calculate exponential backoff delay
        const delay = baseDelay * Math.pow(2, retryCount - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        // If it's not a prepared statement error, throw it immediately
        throw error
      }
    }
  }
  
  throw new Error('Max retries exceeded')
}

// Enhanced Prisma client with retry logic
export const dbWithRetry = {
  user: {
    findUnique: (args: any) => withRetry(() => db.user.findUnique(args)),
    findMany: (args: any) => withRetry(() => db.user.findMany(args)),
    findFirst: (args: any) => withRetry(() => db.user.findFirst(args)),
    create: (args: any) => withRetry(() => db.user.create(args)),
    update: (args: any) => withRetry(() => db.user.update(args)),
    delete: (args: any) => withRetry(() => db.user.delete(args)),
    count: (args?: any) => withRetry(() => db.user.count(args)),
  },
  invoice: {
    findUnique: (args: any) => withRetry(() => db.invoice.findUnique(args)),
    findMany: (args: any) => withRetry(() => db.invoice.findMany(args)),
    findFirst: (args: any) => withRetry(() => db.invoice.findFirst(args)),
    create: (args: any) => withRetry(() => db.invoice.create(args)),
    update: (args: any) => withRetry(() => db.invoice.update(args)),
    delete: (args: any) => withRetry(() => db.invoice.delete(args)),
    count: (args?: any) => withRetry(() => db.invoice.count(args)),
  },
  invoiceHistory: {
    findMany: (args: any) => withRetry(() => db.invoiceHistory.findMany(args)),
    create: (args: any) => withRetry(() => db.invoiceHistory.create(args)),
    createMany: (args: any) => withRetry(() => db.invoiceHistory.createMany(args)),
  },
  $queryRaw: (args: any) => withRetry(() => db.$queryRaw(args)),
  $queryRawUnsafe: (args: any) => withRetry(() => db.$queryRawUnsafe(args)),
  $executeRaw: (args: any) => withRetry(() => db.$executeRaw(args)),
  $transaction: (args: any) => {
    // For transactions, we handle retry at the route level
    return db.$transaction(args)
  }
}