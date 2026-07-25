import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import type { IReservationRepository } from "../modules/wide-label/repositories/reservation-repository.ts";
import { processReservationExpirationJob } from "./reservation-expiration.worker.ts";
import { runReservationSweeperBatch } from "./reservation-sweeper.worker.ts";

export const QUEUE_NAME = "reservation-expiration-queue";

export class BullMQReservationQueueService {
  private redis: Redis;
  private queue: Queue;
  private worker: Worker | null = null;
  private sweeperInterval: NodeJS.Timeout | null = null;

  constructor(redisUrl: string = process.env.REDIS_URL || "redis://127.0.0.1:6379") {
    this.redis = new Redis(redisUrl, { maxRetriesPerRequest: null });
    this.queue = new Queue(QUEUE_NAME, { connection: this.redis });
  }

  async scheduleExpirationJob(
    reservationId: string,
    variantId: string,
    delayMs: number = 15 * 60 * 1000
  ): Promise<void> {
    const jobId = `expire_res_${reservationId}`;
    await this.queue.add(
      "expire-reservation",
      { reservation_id: reservationId, variant_id: variantId },
      {
        delay: delayMs,
        jobId,
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
      }
    );
  }

  startWorker(repository: IReservationRepository): Worker {
    if (this.worker) return this.worker;

    this.worker = new Worker(
      QUEUE_NAME,
      async (job: Job<{ reservation_id: string; variant_id: string }>) => {
        await processReservationExpirationJob(repository, job.data, new Date());
      },
      { connection: this.redis, concurrency: 5 }
    );

    return this.worker;
  }

  startSweeper(repository: IReservationRepository, intervalMs: number = 60000): void {
    if (this.sweeperInterval) return;

    this.sweeperInterval = setInterval(async () => {
      try {
        await runReservationSweeperBatch(repository, new Date());
      } catch (err) {
        console.error("[Reservation Sweeper Error]:", err);
      }
    }, intervalMs);
  }

  async stop(): Promise<void> {
    if (this.sweeperInterval) {
      clearInterval(this.sweeperInterval);
      this.sweeperInterval = null;
    }
    if (this.worker) {
      await this.worker.close();
      this.worker = null;
    }
    await this.queue.close();
    await this.redis.quit();
  }

  getQueue(): Queue {
    return this.queue;
  }
}

let defaultQueueService: BullMQReservationQueueService | null = null;

export function getReservationQueueService(): BullMQReservationQueueService {
  if (!defaultQueueService) {
    defaultQueueService = new BullMQReservationQueueService();
  }
  return defaultQueueService;
}

export async function stopReservationQueueService(): Promise<void> {
  if (defaultQueueService) {
    await defaultQueueService.stop();
    defaultQueueService = null;
  }
}

