import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'
import dotenv from 'dotenv'
import { existsSync } from 'node:fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const envFile = [
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../../../../.env'),
].find((p) => existsSync(p))
if (envFile) dotenv.config({ path: envFile })

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables!')
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
