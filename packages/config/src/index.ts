import { parseEnv } from "./env.js";

export const config = {
  env: process.env.NODE_ENV || "development",
};

export { envSchema, parseEnv, type Env } from "./env.js";
