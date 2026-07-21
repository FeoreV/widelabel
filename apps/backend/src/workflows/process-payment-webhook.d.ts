import type { IReservationRepository } from "../modules/wide-label/repositories/reservation-repository.js";
import type { InMemoryPaymentAttemptRepository, PaymentAttempt } from "../modules/wide-label/models/payment-attempt.js";
import type { YooKassaClient } from "../integrations/yookassa/client.js";
export interface ProcessPaymentWebhookInput {
    provider_payment_id: string;
    event_type: string;
}
export interface ProcessPaymentWebhookResult {
    payment_attempt: PaymentAttempt;
    status: "converted" | "failed" | "already_processed";
}
export declare function processPaymentWebhookWorkflow(reservationRepo: IReservationRepository, paymentAttemptRepo: InMemoryPaymentAttemptRepository, yookassaClient: YooKassaClient, input: ProcessPaymentWebhookInput): Promise<ProcessPaymentWebhookResult>;
