import { betterAuth } from "better-auth"
import { Pool } from "pg"
import { openAPI } from "better-auth/plugins"

export const auth = betterAuth({
  database: new Pool({
    user: "postgres_user",
    password: "postgres_password",
    database: "postgres_db",
    host: "192.168.0.104"
  }),
  emailAndPassword: {
    enabled: true
  },
  plugins: [openAPI()]
})