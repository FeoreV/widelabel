import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import Redis from "ioredis";
import { getPgPool } from "../../infra/db.ts";

export const GET = async (_req: MedusaRequest, res: MedusaResponse): Promise<void> => {
  const timeoutMs = 5000;

  try {
    const pgCheck = Promise.race([
      getPgPool().query("SELECT 1"),
      new Promise((_, reject) => setTimeout(() => reject(new Error("PG timeout")), timeoutMs)),
    ]);

    const pingRedis = async () => {
      const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
        connectTimeout: timeoutMs,
        maxRetriesPerRequest: null,
        family: 4,
      });
      try {
        await redis.ping();
      } finally {
        redis.disconnect();
      }
    };

    const redisCheck = Promise.race([
      pingRedis(),
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
