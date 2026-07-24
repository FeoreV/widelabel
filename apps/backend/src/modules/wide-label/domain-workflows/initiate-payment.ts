import type { IReservationRepository } from "../repositories/reservation-repository.ts";
import type { IPaymentAttemptRepository, PaymentAttempt } from "../models/payment-attempt.ts";
import type { YooKassaClient } from "../../../integrations/yookassa/client.ts";

export interface InitiatePaymentInput {
  cart_id: string;
  reservation_id: string;
  provider: "tinkoff" | "yookassa" | "stripe";
  amount: number;
  currency_code: string;
  idempotency_key: string;
  return_url: string;
}

export interface InitiatePaymentResult {
  payment_attempt: PaymentAttempt;
  confirmation_url: string;
}

export async function initiatePaymentWorkflow(
  reservationRepo: IReservationRepository,
  paymentAttemptRepo: IPaymentAttemptRepository,
  yookassaClient: YooKassaClient,
  input: InitiatePaymentInput
): Promise<InitiatePaymentResult> {
  if (input.provider !== "yookassa") {
    throw new Error(`Unsupported payment provider: '${input.provider}'. Only YooKassa is supported.`);
  }

  const existingAttempt = await paymentAttemptRepo.findByIdempotencyKey(input.idempotency_key);
  if (existingAttempt) {
    return {
      payment_attempt: existingAttempt,
      confirmation_url: existingAttempt.confirmation_url || "",
    };
  }

  const reservation = await reservationRepo.findById(input.reservation_id);
  if (!reservation) {
    throw new Error(`Reservation ${input.reservation_id} not found`);
  }

  if (reservation.cart_id !== input.cart_id) {
    throw new Error("Reservation cart ID mismatch");
  }

  if (reservation.status !== "active" && reservation.status !== "payment_pending") {
    throw new Error(`Cannot initiate payment for reservation with status '${reservation.status}'`);
  }

  if (reservation.status === "active") {
    await reservationRepo.updateStatus(reservation.id, "payment_pending");
  }

  const yooPayment = await yookassaClient.createPayment({
    amount: {
      value: (input.amount / 100).toFixed(2),
      currency: input.currency_code,
    },
    confirmation: {
      type: "redirect",
      return_url: input.return_url,
    },
    capture: true,
    description: `Order for reservation ${reservation.id}`,
    idempotency_key: input.idempotency_key,
    metadata: {
      idempotency_key: input.idempotency_key,
    },
  });

  const confirmationUrl = yooPayment.confirmation?.confirmation_url;
  if (!confirmationUrl) {
    throw new Error("YooKassa payment response missing confirmation_url");
  }

  const paymentAttempt = await paymentAttemptRepo.create({
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    idempotency_key: input.idempotency_key,
    cart_id: input.cart_id,
    reservation_id: input.reservation_id,
    provider: input.provider,
    amount: input.amount,
    currency_code: input.currency_code,
    status: "pending",
    external_payment_id: yooPayment.id,
    confirmation_url: confirmationUrl,
    created_at: new Date(),
    updated_at: new Date(),
  });

  return {
    payment_attempt: paymentAttempt,
    confirmation_url: confirmationUrl,
  };
}
