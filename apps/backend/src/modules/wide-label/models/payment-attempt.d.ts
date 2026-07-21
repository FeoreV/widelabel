import type { PaymentProvider } from "@wide-label/types";
export type PaymentAttemptStatus = "pending" | "succeeded" | "failed" | "canceled";
export interface PaymentAttempt {
    id: string;
    idempotency_key: string;
    cart_id: string;
    reservation_id: string;
    provider: PaymentProvider;
    amount: number;
    currency_code: string;
    status: PaymentAttemptStatus;
    external_payment_id?: string | null;
    created_at: Date;
    updated_at: Date;
}
export declare class DuplicateIdempotencyKeyError extends Error {
    code: string;
    constructor(key: string);
}
export declare class InMemoryPaymentAttemptRepository {
    private attemptsById;
    private attemptsByIdempotencyKey;
    create(attempt: PaymentAttempt): PaymentAttempt;
    findByIdempotencyKey(key: string): PaymentAttempt | null;
    findById(id: string): PaymentAttempt | null;
    updateStatus(id: string, status: PaymentAttemptStatus, externalPaymentId?: string): PaymentAttempt;
}
