import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CheckoutPayloadSchema } from "@wide-label/types";
import {
  PostgresReservationRepository,
  PostgresPaymentAttemptRepository,
} from "../../../../../modules/wide-label/index.ts";
import { YooKassaClient } from "../../../../../integrations/yookassa/client.ts";
import { initiatePaymentWorkflow } from "../../../../../modules/wide-label/domain-workflows/initiate-payment.ts";

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.YOOKASSA_SHOP_ID ||
      process.env.YOOKASSA_SHOP_ID === "test_shop" ||
      !process.env.YOOKASSA_SECRET_KEY ||
      process.env.YOOKASSA_SECRET_KEY === "test_secret")
  ) {
    res.status(500).json({
      code: "PAYMENT_CONFIGURATION_ERROR",
      message: "Production YooKassa credentials are not configured",
      retryable: false,
    });
    return;
  }

  const parseResult = CheckoutPayloadSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      code: "INVALID_INPUT",
      message: "Invalid checkout payload",
      errors: parseResult.error.flatten(),
      retryable: false,
    });
    return;
  }

  const { cart_id, payment } = parseResult.data;

  const reservationRepo: PostgresReservationRepository =
    (req as any).scope?.resolve("reservationRepository") || new PostgresReservationRepository();
  const paymentAttemptRepo: PostgresPaymentAttemptRepository =
    (req as any).scope?.resolve("paymentAttemptRepository") || new PostgresPaymentAttemptRepository();
  const yookassaClient: YooKassaClient =
    (req as any).scope?.resolve("yookassaClient") ||
    new YooKassaClient(
      process.env.YOOKASSA_SHOP_ID || "test_shop",
      process.env.YOOKASSA_SECRET_KEY || "test_secret"
    );

  try {
    const openReservations = await reservationRepo.findOpenByCart(cart_id);
    const openReservation = openReservations[0];

    if (!openReservation) {
      res.status(400).json({
        code: "NO_ACTIVE_RESERVATION",
        message: "No active reservation found for this cart",
        retryable: false,
      });
      return;
    }

    const idempotencyKey =
      (req.headers["x-idempotency-key"] as string) || `idem_${cart_id}_${openReservation.id}`;
    const returnUrl =
      process.env.YOOKASSA_RETURN_URL || "http://localhost:3000/checkout/success";

    const amount = (req.body as any).amount && typeof (req.body as any).amount === "number"
      ? (req.body as any).amount
      : 15000;
    const currencyCode = "RUB";

    const result = await initiatePaymentWorkflow(
      reservationRepo,
      paymentAttemptRepo,
      yookassaClient,
      {
        cart_id,
        reservation_id: openReservation.id,
        provider: payment.provider as any,
        amount,
        currency_code: currencyCode,
        idempotency_key: idempotencyKey,
        return_url: returnUrl,
      }
    );

    res.status(200).json({
      payment_attempt_id: result.payment_attempt.id,
      status: result.payment_attempt.status,
      confirmation_url: result.confirmation_url,
    });
  } catch (err: any) {
    res.status(400).json({
      code: "PAYMENT_INITIATION_FAILED",
      message: err.message || "Failed to initiate payment",
      retryable: false,
    });
  }
};
