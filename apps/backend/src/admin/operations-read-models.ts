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

export class OperationsReadModelsService {
  private activeHolds: Array<{ id: string; variant_id: string; expires_at: Date }> = [];
  private paymentFailures: PaymentFailureRecord[] = [];
  private webhookLags: number[] = []; // array of lag durations in ms
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
