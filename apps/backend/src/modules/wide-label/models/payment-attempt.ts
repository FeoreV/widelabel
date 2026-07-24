import type pg from "pg";
import { getPgPool } from "../../../infra/db.ts";
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

export interface IPaymentAttemptRepository {
  create(attempt: PaymentAttempt): Promise<PaymentAttempt>;
  findByIdempotencyKey(key: string): Promise<PaymentAttempt | null>;
  findById(id: string): Promise<PaymentAttempt | null>;
  updateStatus(
    id: string,
    status: PaymentAttemptStatus,
    externalPaymentId?: string
  ): Promise<PaymentAttempt>;
}

export class PostgresPaymentAttemptRepository implements IPaymentAttemptRepository {
  private pool: pg.Pool;

  constructor(pool: pg.Pool = getPgPool()) {
    this.pool = pool;
  }

  private mapRow(row: any): PaymentAttempt {
    return {
      id: row.id,
      idempotency_key: row.idempotency_key,
      cart_id: row.order_id || row.cart_id,
      reservation_id: row.reservation_id || row.id,
      provider: row.provider as PaymentProvider,
      amount: Number(row.amount),
      currency_code: row.currency_code.trim(),
      status: row.status as PaymentAttemptStatus,
      external_payment_id: row.provider_payment_id ?? null,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  public async create(attempt: PaymentAttempt): Promise<PaymentAttempt> {
    const now = attempt.created_at || new Date();
    try {
      const res = await this.pool.query(
        `INSERT INTO wide_label_payment_attempt (
           ${attempt.id ? "id," : ""} order_id, provider, provider_payment_id, status, amount, currency_code, idempotency_key, created_at, updated_at
         ) VALUES (
           ${attempt.id ? "$1," : ""} ${attempt.id ? "$2" : "$1"}, ${attempt.id ? "$3" : "$2"}, ${attempt.id ? "$4" : "$3"}, ${attempt.id ? "$5" : "$4"}, ${attempt.id ? "$6" : "$5"}, ${attempt.id ? "$7" : "$6"}, ${attempt.id ? "$8" : "$7"}, ${attempt.id ? "$9" : "$8"}, ${attempt.id ? "$10" : "$9"}
         ) RETURNING *`,
        attempt.id
          ? [attempt.id, attempt.cart_id, attempt.provider, attempt.external_payment_id || null, attempt.status, attempt.amount, attempt.currency_code, attempt.idempotency_key, now, now]
          : [attempt.cart_id, attempt.provider, attempt.external_payment_id || null, attempt.status, attempt.amount, attempt.currency_code, attempt.idempotency_key, now, now]
      );
      return this.mapRow(res.rows[0]);
    } catch (err: any) {
      if (err.code === "23505" || err.message?.includes("idempotency_key")) {
        throw new DuplicateIdempotencyKeyError(attempt.idempotency_key);
      }
      throw err;
    }
  }

  public async findByIdempotencyKey(key: string): Promise<PaymentAttempt | null> {
    const res = await this.pool.query(
      `SELECT * FROM wide_label_payment_attempt WHERE idempotency_key = $1`,
      [key]
    );
    if (res.rows.length === 0) return null;
    return this.mapRow(res.rows[0]);
  }

  public async findById(id: string): Promise<PaymentAttempt | null> {
    const res = await this.pool.query(
      `SELECT * FROM wide_label_payment_attempt WHERE id = $1`,
      [id]
    );
    if (res.rows.length === 0) return null;
    return this.mapRow(res.rows[0]);
  }

  public async updateStatus(
    id: string,
    status: PaymentAttemptStatus,
    externalPaymentId?: string
  ): Promise<PaymentAttempt> {
    const now = new Date();
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`PaymentAttempt ${id} not found`);
    }

    const providerPaymentId = externalPaymentId !== undefined ? externalPaymentId : existing.external_payment_id;

    const res = await this.pool.query(
      `UPDATE wide_label_payment_attempt
       SET status = $1, provider_payment_id = $2, updated_at = $3
       WHERE id = $4
       RETURNING *`,
      [status, providerPaymentId, now, id]
    );

    if (res.rows.length === 0) {
      throw new Error(`PaymentAttempt ${id} not found during status update`);
    }

    return this.mapRow(res.rows[0]);
  }
}

export class InMemoryPaymentAttemptRepository implements IPaymentAttemptRepository {
  private attemptsById = new Map<string, PaymentAttempt>();
  private attemptsByIdempotencyKey = new Map<string, PaymentAttempt>();

  public async create(attempt: PaymentAttempt): Promise<PaymentAttempt> {
    if (this.attemptsByIdempotencyKey.has(attempt.idempotency_key)) {
      throw new DuplicateIdempotencyKeyError(attempt.idempotency_key);
    }

    const stored: PaymentAttempt = { ...attempt };
    this.attemptsById.set(attempt.id, stored);
    this.attemptsByIdempotencyKey.set(attempt.idempotency_key, stored);
    return stored;
  }

  public async findByIdempotencyKey(key: string): Promise<PaymentAttempt | null> {
    return this.attemptsByIdempotencyKey.get(key) || null;
  }

  public async findById(id: string): Promise<PaymentAttempt | null> {
    return this.attemptsById.get(id) || null;
  }

  public async updateStatus(
    id: string,
    status: PaymentAttemptStatus,
    externalPaymentId?: string
  ): Promise<PaymentAttempt> {
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
