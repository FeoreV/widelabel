/**
 * Observability service providing OpenTelemetry-compatible tracing and
 * Sentry-style error reporting without leaking secrets or payment data.
 *
 * Rules:
 * - NEVER log: payment credentials, card numbers, YooKassa keys, provider tokens,
 *   OrderSnapshot payment fields, customer PII (email in full, card data).
 * - Safe to log: trace IDs, span IDs, reservation IDs, variant IDs, status names,
 *   error codes, HTTP status codes, latency, operation names.
 */
/** Scrubs sensitive fields to prevent accidental PII/secret leakage */
export function sanitizeAttributes(raw) {
    const BLOCKED_KEYS = new Set([
        "password",
        "secret",
        "token",
        "api_key",
        "authorization",
        "card_number",
        "cvv",
        "pan",
        "email",
        "phone",
        "amount",
        "currency",
        "price",
        "payment_id",
        "external_payment_id",
        "idempotency_key",
        "consent_hash",
    ]);
    const result = {};
    for (const [key, value] of Object.entries(raw)) {
        const lk = key.toLowerCase();
        if (BLOCKED_KEYS.has(lk) || lk.includes("secret") || lk.includes("token") || lk.includes("key")) {
            result[key] = "[REDACTED]";
        }
        else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
            result[key] = value;
        }
        else {
            result[key] = String(value);
        }
    }
    return result;
}
function generateId(prefix) {
    return `${prefix}_${Date.now().toString(16)}_${Math.random().toString(36).substring(2, 8)}`;
}
export class ObservabilityService {
    spans = [];
    errorReports = [];
    activeTraceId = null;
    startTrace(operation) {
        const traceId = generateId("tr");
        const spanId = generateId("sp");
        this.activeTraceId = traceId;
        const span = {
            traceId,
            spanId,
            operation,
            startMs: Date.now(),
            status: "ok",
            attributes: {},
        };
        this.spans.push(span);
        return { traceId, spanId };
    }
    endSpan(spanId, status, attributes = {}) {
        const span = this.spans.find((s) => s.spanId === spanId);
        if (!span)
            return;
        span.endMs = Date.now();
        span.status = status;
        span.attributes = { ...span.attributes, ...sanitizeAttributes(attributes) };
    }
    recordError(spanId, error, attributes = {}) {
        const span = this.spans.find((s) => s.spanId === spanId);
        if (!span)
            return;
        span.status = "error";
        span.attributes = { ...span.attributes, ...sanitizeAttributes(attributes) };
        span.errorCode = error.code || "UNKNOWN_ERROR";
        const report = {
            traceId: span.traceId,
            spanId: span.spanId,
            operation: span.operation,
            errorCode: span.errorCode,
            message: error.message,
            timestamp: new Date(),
        };
        this.errorReports.push(report);
    }
    getSpan(spanId) {
        return this.spans.find((s) => s.spanId === spanId) || null;
    }
    getErrorReports() {
        return [...this.errorReports];
    }
    getSpanLatencyMs(spanId) {
        const span = this.spans.find((s) => s.spanId === spanId);
        if (!span || span.endMs === undefined)
            return null;
        return span.endMs - span.startMs;
    }
}
