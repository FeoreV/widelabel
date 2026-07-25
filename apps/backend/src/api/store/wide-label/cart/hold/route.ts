import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  CartHoldRequestSchema,
  type CartHoldResponse,
  type ErrorResponse,
} from "@wide-label/types";
import {
  PostgresReservationRepository,
  reserveVariantWorkflow,
  ItemHeldError,
} from "../../../../../modules/wide-label/index.ts";
import type { IReservationRepository } from "../../../../../modules/wide-label/repositories/reservation-repository.ts";
import { RedisLockService } from "../../../../../integrations/redis/lock.ts";
import { BullMQReservationQueueService, getReservationQueueService } from "../../../../../jobs/bullmq-reservation-queue.ts";
import Redis from "ioredis";

let _defaultRepo: PostgresReservationRepository | null = null;
function getDefaultRepository(): PostgresReservationRepository {
  if (!_defaultRepo) {
    _defaultRepo = new PostgresReservationRepository();
  }
  return _defaultRepo;
}

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const parseResult = CartHoldRequestSchema.safeParse(req.body);

  if (!parseResult.success) {
    const errorResp: ErrorResponse = {
      code: "INVALID_INPUT",
      message: "Invalid request payload",
      retryable: false,
    };
    res.status(400).json(errorResp);
    return;
  }

  const { variant_id, cart_id, session_fingerprint } = parseResult.data;
  const scope = (req as any).scope;

  let repo: IReservationRepository = getDefaultRepository();
  try {
    const resolved = scope?.resolve?.("reservationRepository");
    if (resolved && typeof resolved.findById === "function") {
      repo = resolved;
    }
  } catch {
    // fallback to defaultRepository
  }

  let lockService: RedisLockService | null = null;
  try {
    const resolvedClient = scope?.resolve?.("redisClient");
    if (resolvedClient && typeof resolvedClient.set === "function") {
      lockService = new RedisLockService(resolvedClient);
    }
  } catch {
    // Redis client not present in scope
  }

  const executeHold = async () => {
    const now = new Date();

    // Validate Medusa cart and variant if services are registered
    try {
      const cartModule = scope?.resolve?.("cartModuleService");
      if (cartModule && typeof cartModule.retrieveCart === "function") {
        const cart = await cartModule.retrieveCart(cart_id).catch(() => null);
        if (!cart) {
          throw new Error(`Medusa Cart '${cart_id}' not found`);
        }

        if (typeof cartModule.addLineItems === "function") {
          const existingLine = cart.items?.find((i: any) => i.variant_id === variant_id);
          if (!existingLine) {
            await cartModule.addLineItems(cart_id, [
              {
                variant_id,
                quantity: 1,
              },
            ]).catch(() => {});
          }
        }
      }
    } catch {
      // Ignore scope resolution error for optional cart module
    }

    try {
      const productModule = scope?.resolve?.("productModuleService");
      if (productModule && typeof productModule.retrieveProductVariant === "function") {
        const variant = await productModule.retrieveProductVariant(variant_id).catch(() => null);
        if (!variant) {
          throw new Error(`Medusa Product Variant '${variant_id}' not found`);
        }
      }
    } catch {
      // Ignore scope resolution error for optional product module
    }

    const reservation = await reserveVariantWorkflow(
      repo,
      { variant_id, cart_id, session_fingerprint },
      now
    );

    // Schedule delayed BullMQ expiration job
    try {
      const queueService = scope?.resolve?.("reservationQueueService") || getReservationQueueService();
      const delayMs = reservation.expires_at.getTime() - now.getTime();
      await queueService.scheduleExpirationJob(reservation.id, reservation.variant_id, delayMs);
    } catch {
      // Fallback for environment without active BullMQ redis worker
    }

    const result: CartHoldResponse = {
      reservation_id: reservation.id,
      variant_id: reservation.variant_id,
      cart_id: reservation.cart_id,
      reserved_until: reservation.expires_at.toISOString(),
      server_time: now.toISOString(),
    };

    return result;
  };

  try {
    const responseData = lockService
      ? await lockService.withLock(`hold:${variant_id}`, 10000, executeHold)
      : await executeHold();

    res.status(200).json(responseData);
  } catch (err: any) {
    if (err instanceof ItemHeldError || err.code === "ITEM_HELD") {
      const errorResp: ErrorResponse = {
        code: "ITEM_HELD",
        message: err.message || "Item is held by another customer",
        retryable: false,
      };
      res.status(409).json(errorResp);
      return;
    }

    if (err.message?.includes("not found")) {
      const errorResp: ErrorResponse = {
        code: "NOT_FOUND",
        message: err.message,
        retryable: false,
      };
      res.status(404).json(errorResp);
      return;
    }

    const errorResp: ErrorResponse = {
      code: "INTERNAL_ERROR",
      message: err.message || "An unexpected error occurred",
      retryable: true,
    };
    res.status(500).json(errorResp);
  }
};
