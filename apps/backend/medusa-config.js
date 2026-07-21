import { defineConfig } from "@medusajs/utils";

function requireSecret(name) {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(
      `[medusa-config] Required secret "${name}" is not set. ` +
        "Refusing to start in production without explicit secrets."
    );
  }
  return value ?? "";
}

export default defineConfig({
  admin: {
    disable: true,
  },
  projectConfig: {
    databaseUrl:
      process.env.DATABASE_URL ||
      "postgres://wide_label:wide_label@localhost:5432/wide_label",
    databaseDriverOptions: process.env.DATABASE_DRIVER_OPTIONS
      ? JSON.parse(process.env.DATABASE_DRIVER_OPTIONS)
      : process.env.DATABASE_URL?.includes("ssl_mode=disable") ||
        process.env.DATABASE_URL?.includes("sslmode=disable") ||
        process.env.NODE_ENV !== "production"
      ? { connection: { ssl: false } }
      : { connection: { ssl: false } },
    redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:3000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:7001",
      authCors: process.env.AUTH_CORS || "http://localhost:7001",
      jwtSecret: requireSecret("JWT_SECRET"),
      cookieSecret: requireSecret("COOKIE_SECRET"),
    },
  },
  modules: process.env.REDIS_URL
    ? [
        {
          resolve: "@medusajs/medusa/event-bus-redis",
          options: {
            redisUrl: process.env.REDIS_URL,
          },
        },
        {
          resolve: "@medusajs/medusa/workflow-engine-redis",
          options: {
            redisUrl: process.env.REDIS_URL,
          },
        },
      ]
    : [],
});
