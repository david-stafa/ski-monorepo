import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

export const PORT = z.coerce.number().default(3000).parse(process.env.PORT)
export const API_URL = z
  .string()
  .default('http://localhost:3000')
  .parse(process.env.API_URL)
export const WEB_URL = z
  .string()
  .default('http://localhost:5173')
  .parse(process.env.WEB_URL)