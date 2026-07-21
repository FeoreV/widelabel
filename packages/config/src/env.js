import { z } from "zod";
export const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.string().optional().default("9000"),
    DATABASE_URL: z.string().optional(),
    REDIS_URL: z.string().optional(),
});
export function parseEnv(envInput = process.env) {
    return envSchema.parse(envInput);
}
