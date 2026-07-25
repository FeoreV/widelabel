import assert from "node:assert";
import test from "node:test";
import { BullMQReservationQueueService, QUEUE_NAME } from "../src/jobs/bullmq-reservation-queue.ts";
import { PostgresReservationRepository } from "../src/modules/wide-label/repositories/reservation-repository.ts";
import { getPgPool, closePgPool } from "../src/infra/db.ts";

test("P0-3 Integration: Worker registration, delayed job scheduling, sweeper startup and graceful shutdown", async () => {
  const queueService = new BullMQReservationQueueService();
  const repo = new PostgresReservationRepository(getPgPool());

  // 1. Verify Queue instance created
  const queue = queueService.getQueue();
  assert.strictEqual(queue.name, QUEUE_NAME);

  // 2. Start Worker instance
  const worker = queueService.startWorker(repo);
  assert.ok(worker);
  assert.strictEqual(worker.name, QUEUE_NAME);

  // 3. Schedule expiration job in Redis BullMQ queue
  const resId = `res_queue_test_${Date.now()}`;
  const variantId = `var_queue_test_${Date.now()}`;
  await queueService.scheduleExpirationJob(resId, variantId, 60000);

  const job = await queue.getJob(`expire_res_${resId}`);
  assert.ok(job);
  assert.strictEqual(job.data.reservation_id, resId);

  // 4. Start Sweeper startup
  queueService.startSweeper(repo, 300000);

  // 5. Clean shutdown
  await queueService.stop();
});

test.after(async () => {
  await closePgPool();
});

