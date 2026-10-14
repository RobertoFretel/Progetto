import { createAuthClient } from "better-auth/client"
import { treaty } from "@elysia/eden"
import type { Api } from "@/api"

export const authClient = createAuthClient({
  baseURL: `${window.location.protocol}//${window.location.host}`
})
export const apiClient = treaty<Api>(window.location.host)