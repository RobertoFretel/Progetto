import { betterAuth } from "better-auth"
import { Pool } from "pg"
import { openAPI } from "better-auth/plugins"

export const auth = betterAuth({
  database: new Pool({
    user: import.meta.env.POSTGRES_USER,
    password: import.meta.env.POSTGRES_PASSWORD,
    database: import.meta.env.POSTGRES_DATABASE,
    host: import.meta.env.POSTGRES_HOST
  }),
  emailAndPassword: {
    enabled: true
  },
  plugins: [openAPI()],
  baseURL: {
    allowedHosts: ['localhost:*']
  }
})