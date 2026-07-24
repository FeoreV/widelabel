import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import Redis from "ioredis";
import { getPgPool } from "../../infra/db.ts";

export const GET = async (_req: MedusaRequest, res: MedusaResponse): Promise<void> => {
  const timeoutMs = 2000;

  try {
    const pgCheck = Promise.race([
      getPgPool().query("SELECT 1"),
      new Promise((_, reject) => setTimeout(() => reject(new Error("PG timeout")), timeoutMs)),
    ]);

    const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      connectTimeout: timeoutMs,
      maxRetriesPerRequest: 1,
    });

    const redisCheck = Promise.race([
      redis.ping().finally(() => redis.quit()),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Redis timeout")), timeoutMs)),
    ]);

    await Promise.all([pgCheck, redisCheck]);

    res.status(200).json({ status: "ready", postgres: "ok", redis: "ok" });
  } catch (err: any) {
    res.status(503).json({
      status: "unready",
      error: err.message || "Dependency healthcheck failed",
    });
  }
};
