import type { IReservationRepository } from "../repositories/reservation-repository.ts";
import type { IPaymentAttemptRepository, PaymentAttempt } from "../models/payment-attempt.ts";
import type { YooKassaClient } from "../../../integrations/yookassa/client.ts";

export interface ProcessPaymentWebhookInput {
  provider_payment_id: string;
  event_type: string;
}

export interface ProcessPaymentWebhookResult {
  payment_attempt: PaymentAttempt;
  status: "converted" | "failed" | "already_processed";
}

export async function processPaymentWebhookWorkflow(
  reservationRepo: IReservationRepository,
  paymentAttemptRepo: IPaymentAttemptRepository,
  yookassaClient: YooKassaClient,
  input: ProcessPaymentWebhookInput
): Promise<ProcessPaymentWebhookResult> {
  const verifiedPayment = await yookassaClient.getPayment(input.provider_payment_id);

  let attempt = await paymentAttemptRepo.findByIdempotencyKey(
    verifiedPayment.metadata?.idempotency_key || ""
  );

  if (!attempt && (paymentAttemptRepo as any).attemptsById) {
    attempt = Array.from((paymentAttemptRepo as any).attemptsById.values() as IterableIterator<PaymentAttempt>).find(
      (a) => a.external_payment_id === input.provider_payment_id
    ) || null;
  }

  if (!attempt) {
    throw new Error(`No PaymentAttempt found for external payment ID '${input.provider_payment_id}'`);
  }

  if (attempt.status === "succeeded") {
    return {
      payment_attempt: attempt,
      status: "already_processed",
    };
  }

  const verifiedAmountCents = Math.round(parseFloat(verifiedPayment.amount.value) * 100);
  if (
    verifiedAmountCents !== attempt.amount ||
    verifiedPayment.amount.currency !== attempt.currency_code
  ) {
    await paymentAttemptRepo.updateStatus(attempt.id, "failed");
    throw new Error(
      `Payment amount/currency mismatch. Expected ${attempt.amount} ${attempt.currency_code}, got ${verifiedAmountCents} ${verifiedPayment.amount.currency}`
    );
  }

  const reservation = await reservationRepo.findById(attempt.reservation_id);
  if (!reservation) {
    throw new Error(`Reservation '${attempt.reservation_id}' not found`);
  }

  if (verifiedPayment.status === "succeeded" && verifiedPayment.paid) {
    const updatedAttempt = await paymentAttemptRepo.updateStatus(attempt.id, "succeeded");
    await reservationRepo.updateStatus(reservation.id, "converted", {
      converted_at: new Date(),
    });

    return {
      payment_attempt: updatedAttempt,
      status: "converted",
    };
  } else if (verifiedPayment.status === "canceled") {
    const updatedAttempt = await paymentAttemptRepo.updateStatus(attempt.id, "canceled");
    await reservationRepo.updateStatus(reservation.id, "released", {
      released_at: new Date(),
      release_reason: "payment_canceled",
    });

    return {
      payment_attempt: updatedAttempt,
      status: "failed",
    };
  }

  return {
    payment_attempt: attempt,
    status: "already_processed",
  };
}
