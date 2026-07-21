import type { IReservationRepository } from "../modules/wide-label/repositories/reservation-repository.js";
import type { InMemoryPaymentAttemptRepository, PaymentAttempt } from "../modules/wide-label/models/payment-attempt.js";
import type { YooKassaClient } from "../integrations/yookassa/client.js";
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
export declare function initiatePaymentWorkflow(reservationRepo: IReservationRepository, paymentAttemptRepo: InMemoryPaymentAttemptRepository, yookassaClient: YooKassaClient, input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
