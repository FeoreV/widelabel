import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  PostgresReservationRepository,
  PostgresPaymentAttemptRepository,
} from "../../../../../../modules/wide-label/index.ts";
import { YooKassaClient } from "../../../../../../integrations/yookassa/client.ts";
import { processPaymentWebhookWorkflow } from "../../../../../../modules/wide-label/domain-workflows/process-payment-webhook.ts";

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const body = req.body as any;
  const event = body?.event;
  const paymentId = body?.object?.id;

  if (!event || !paymentId) {
    res.status(400).json({
      code: "INVALID_WEBHOOK_PAYLOAD",
      message: "Missing event or object.id",
      retryable: false,
    });
    return;
  }

  const reservationRepo =
    (req as any).scope?.resolve("reservationRepository") || new PostgresReservationRepository();
  const paymentAttemptRepo =
    (req as any).scope?.resolve("paymentAttemptRepository") || new PostgresPaymentAttemptRepository();
  const yookassaClient =
    (req as any).scope?.resolve("yookassaClient") ||
    new YooKassaClient(
      process.env.YOOKASSA_SHOP_ID || "test_shop",
      process.env.YOOKASSA_SECRET_KEY || "test_secret"
    );

  try {
    const result = await processPaymentWebhookWorkflow(
      reservationRepo,
      paymentAttemptRepo,
      yookassaClient,
      {
        provider_payment_id: paymentId,
        event_type: event,
      }
    );

    res.status(200).json({
      status: result.status,
      payment_attempt_id: result.payment_attempt.id,
    });
  } catch (err: any) {
    res.status(400).json({
      code: "WEBHOOK_PROCESSING_FAILED",
      message: err.message || "Failed to process webhook",
      retryable: false,
    });
  }
};
