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
    allowedHosts: ['localhost:*', '192.168.0.156:*', '192.168.0.104:*']
  },
  trustedOrigins: [
    "http://localhost:5173",          // se usi Vite in locale
    "http://192.168.0.156:5173",      // il tuo IP locale per testare da telefono
    "http://192.168.0.104:5173",      // il tuo IP del raspberry per testare da telefono
  ],
})