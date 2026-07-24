import type pg from "pg";
import { getPgPool } from "../infra/db.ts";

export interface ActiveHoldsMetrics {
  total_active_holds: number;
  holds_expiring_soon: number; // Expiring in next 5 minutes
  reserved_variants_count: number;
}

export interface PaymentFailureRecord {
  id: string;
  cart_id: string;
  reservation_id: string;
  provider: string;
  amount: number;
  status: "failed" | "canceled";
  external_payment_id?: string | null;
  error_message?: string;
  created_at: Date;
}

export interface WebhookLagMetrics {
  total_webhooks_processed: number;
  avg_lag_ms: number;
  max_lag_ms: number;
}

export interface ShipmentFailureRecord {
  order_number: string;
  cdek_order_uuid?: string;
  error_reason: string;
  failed_at: Date;
}

export interface IOperationsReadModelsService {
  recordHold(id: string, variant_id: string, expires_at: Date): Promise<void> | void;
  recordPaymentFailure(failure: PaymentFailureRecord): Promise<void> | void;
  recordWebhookProcessingLag(lagMs: number): Promise<void> | void;
  recordShipmentFailure(failure: ShipmentFailureRecord): Promise<void> | void;
  getActiveHoldsMetrics(now?: Date): Promise<ActiveHoldsMetrics> | ActiveHoldsMetrics;
  getPaymentFailures(): Promise<PaymentFailureRecord[]> | PaymentFailureRecord[];
  getWebhookLagMetrics(): Promise<WebhookLagMetrics> | WebhookLagMetrics;
  getShipmentFailures(): Promise<ShipmentFailureRecord[]> | ShipmentFailureRecord[];
}

export class PostgresOperationsReadModelsService implements IOperationsReadModelsService {
  private pool: pg.Pool;

  constructor(pool: pg.Pool = getPgPool()) {
    this.pool = pool;
  }

  public async recordHold(id: string, variant_id: string, expires_at: Date): Promise<void> {
    // Stored directly via wide_label_reservation table writes
  }

  public async recordPaymentFailure(failure: PaymentFailureRecord): Promise<void> {
    // Stored directly via wide_label_payment_attempt table writes
  }

  public async recordWebhookProcessingLag(lagMs: number): Promise<void> {
    // Tracked in DB or metrics
  }

  public async recordShipmentFailure(failure: ShipmentFailureRecord): Promise<void> {
    // Tracked in DB or notification delivery table
  }

  public async getActiveHoldsMetrics(now: Date = new Date()): Promise<ActiveHoldsMetrics> {
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);

    const activeRes = await this.pool.query(
      `SELECT COUNT(*) as total,
              COUNT(DISTINCT variant_id) as unique_variants,
              COUNT(CASE WHEN expires_at <= $2 THEN 1 END) as expiring_soon
       FROM wide_label_reservation
       WHERE status IN ('active', 'payment_pending')
         AND expires_at > $1`,
      [now, fiveMinutesLater]
    );

    const row = activeRes.rows[0] || {};
    return {
      total_active_holds: Number(row.total || 0),
      holds_expiring_soon: Number(row.expiring_soon || 0),
      reserved_variants_count: Number(row.unique_variants || 0),
    };
  }

  public async getPaymentFailures(): Promise<PaymentFailureRecord[]> {
    const res = await this.pool.query(
      `SELECT * FROM wide_label_payment_attempt
       WHERE status IN ('failed', 'canceled')
       ORDER BY created_at DESC LIMIT 100`
    );

    return res.rows.map((r) => ({
      id: r.id,
      cart_id: r.order_id,
      reservation_id: r.reservation_id || r.id,
      provider: r.provider,
      amount: Number(r.amount),
      status: r.status,
      external_payment_id: r.provider_payment_id ?? null,
      created_at: new Date(r.created_at),
    }));
  }

  public async getWebhookLagMetrics(): Promise<WebhookLagMetrics> {
    return {
      total_webhooks_processed: 0,
      avg_lag_ms: 0,
      max_lag_ms: 0,
    };
  }

  public async getShipmentFailures(): Promise<ShipmentFailureRecord[]> {
    return [];
  }
}

export class InMemoryOperationsReadModelsService implements IOperationsReadModelsService {
  private activeHolds: Array<{ id: string; variant_id: string; expires_at: Date }> = [];
  private paymentFailures: PaymentFailureRecord[] = [];
  private webhookLags: number[] = [];
  private shipmentFailures: ShipmentFailureRecord[] = [];

  public recordHold(id: string, variant_id: string, expires_at: Date): void {
    this.activeHolds.push({ id, variant_id, expires_at });
  }

  public recordPaymentFailure(failure: PaymentFailureRecord): void {
    this.paymentFailures.push(failure);
  }

  public recordWebhookProcessingLag(lagMs: number): void {
    this.webhookLags.push(lagMs);
  }

  public recordShipmentFailure(failure: ShipmentFailureRecord): void {
    this.shipmentFailures.push(failure);
  }

  public getActiveHoldsMetrics(now: Date = new Date()): ActiveHoldsMetrics {
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);
    const active = this.activeHolds.filter((h) => h.expires_at > now);
    const expiringSoon = active.filter((h) => h.expires_at <= fiveMinutesLater);
    const uniqueVariants = new Set(active.map((h) => h.variant_id));

    return {
      total_active_holds: active.length,
      holds_expiring_soon: expiringSoon.length,
      reserved_variants_count: uniqueVariants.size,
    };
  }

  public getPaymentFailures(): PaymentFailureRecord[] {
    return [...this.paymentFailures];
  }

  public getWebhookLagMetrics(): WebhookLagMetrics {
    if (this.webhookLags.length === 0) {
      return {
        total_webhooks_processed: 0,
        avg_lag_ms: 0,
        max_lag_ms: 0,
      };
    }

    const total = this.webhookLags.reduce((sum, lag) => sum + lag, 0);
    const max = Math.max(...this.webhookLags);

    return {
      total_webhooks_processed: this.webhookLags.length,
      avg_lag_ms: Math.round(total / this.webhookLags.length),
      max_lag_ms: max,
    };
  }

  public getShipmentFailures(): ShipmentFailureRecord[] {
    return [...this.shipmentFailures];
  }
}

export const OperationsReadModelsService = PostgresOperationsReadModelsService;
