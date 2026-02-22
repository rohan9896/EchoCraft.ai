import { createAuthClient } from "better-auth/react"
import { env } from "process"
// import { env } from "process/env"
export const authClient = createAuthClient({
    baseURL: env.BETTER_AUTH_URL
})