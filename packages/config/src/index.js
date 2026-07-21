export const config = {
    env: process.env.NODE_ENV || "development",
};
export { envSchema, parseEnv } from "./env.js";
