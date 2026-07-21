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

export class DuplicateIdempotencyKeyError extends Error {
  public code = "DUPLICATE_IDEMPOTENCY_KEY";
  constructor(key: string) {
    super(`PaymentAttempt with idempotency_key '${key}' already exists`);
    this.name = "DuplicateIdempotencyKeyError";
  }
}

export class InMemoryPaymentAttemptRepository {
  private attemptsById = new Map<string, PaymentAttempt>();
  private attemptsByIdempotencyKey = new Map<string, PaymentAttempt>();

  public create(attempt: PaymentAttempt): PaymentAttempt {
    if (this.attemptsByIdempotencyKey.has(attempt.idempotency_key)) {
      throw new DuplicateIdempotencyKeyError(attempt.idempotency_key);
    }

    const stored: PaymentAttempt = { ...attempt };
    this.attemptsById.set(attempt.id, stored);
    this.attemptsByIdempotencyKey.set(attempt.idempotency_key, stored);
    return stored;
  }

  public findByIdempotencyKey(key: string): PaymentAttempt | null {
    return this.attemptsByIdempotencyKey.get(key) || null;
  }

  public findById(id: string): PaymentAttempt | null {
    return this.attemptsById.get(id) || null;
  }

  public updateStatus(
    id: string,
    status: PaymentAttemptStatus,
    externalPaymentId?: string
  ): PaymentAttempt {
    const attempt = this.attemptsById.get(id);
    if (!attempt) {
      throw new Error(`PaymentAttempt ${id} not found`);
    }

    attempt.status = status;
    if (externalPaymentId !== undefined) {
      attempt.external_payment_id = externalPaymentId;
    }
    attempt.updated_at = new Date();
    return attempt;
  }
}
