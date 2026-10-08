import { createAuthClient } from "better-auth/client"
import { treaty } from "@elysia/eden"
import type { Api } from "@/api"

export const authClient = createAuthClient({})
export const apiClient = treaty<Api>("localhost:3000")