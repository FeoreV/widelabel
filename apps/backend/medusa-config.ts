import { defineConfig } from "@medusajs/utils";

function requireSecret(name: string): string {
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
  projectConfig: {
    databaseUrl:
      process.env.DATABASE_URL ||
      "postgres://wide_label:wide_label@localhost:5432/wide_label",
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:3000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:7001",
      authCors: process.env.AUTH_CORS || "http://localhost:7001",
      jwtSecret: requireSecret("JWT_SECRET"),
      cookieSecret: requireSecret("COOKIE_SECRET"),
    },
  },
});
