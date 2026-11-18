export { cn } from "cn"

export const HEADSCALE_API_PREFIX = (
    process.env.HEADSCALE_API_PREFIX?.trim() || "/api/v1"
).replace(/\/+$/, "");