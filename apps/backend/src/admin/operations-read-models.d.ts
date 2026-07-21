export interface ActiveHoldsMetrics {
    total_active_holds: number;
    holds_expiring_soon: number;
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
export declare class OperationsReadModelsService {
    private activeHolds;
    private paymentFailures;
    private webhookLags;
    private shipmentFailures;
    recordHold(id: string, variant_id: string, expires_at: Date): void;
    recordPaymentFailure(failure: PaymentFailureRecord): void;
    recordWebhookProcessingLag(lagMs: number): void;
    recordShipmentFailure(failure: ShipmentFailureRecord): void;
    getActiveHoldsMetrics(now?: Date): ActiveHoldsMetrics;
    getPaymentFailures(): PaymentFailureRecord[];
    getWebhookLagMetrics(): WebhookLagMetrics;
    getShipmentFailures(): ShipmentFailureRecord[];
}
