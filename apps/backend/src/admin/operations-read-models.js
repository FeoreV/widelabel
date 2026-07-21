export class OperationsReadModelsService {
    activeHolds = [];
    paymentFailures = [];
    webhookLags = []; // array of lag durations in ms
    shipmentFailures = [];
    recordHold(id, variant_id, expires_at) {
        this.activeHolds.push({ id, variant_id, expires_at });
    }
    recordPaymentFailure(failure) {
        this.paymentFailures.push(failure);
    }
    recordWebhookProcessingLag(lagMs) {
        this.webhookLags.push(lagMs);
    }
    recordShipmentFailure(failure) {
        this.shipmentFailures.push(failure);
    }
    getActiveHoldsMetrics(now = new Date()) {
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
    getPaymentFailures() {
        return [...this.paymentFailures];
    }
    getWebhookLagMetrics() {
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
    getShipmentFailures() {
        return [...this.shipmentFailures];
    }
}
