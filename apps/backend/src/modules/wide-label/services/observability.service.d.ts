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
export type SpanStatus = "ok" | "error" | "timeout";
export interface TraceSpan {
    traceId: string;
    spanId: string;
    operation: string;
    startMs: number;
    endMs?: number;
    status: SpanStatus;
    attributes: Record<string, string | number | boolean>;
    errorCode?: string;
}
export interface ErrorReport {
    traceId: string;
    spanId: string;
    operation: string;
    errorCode: string;
    message: string;
    timestamp: Date;
}
/** Scrubs sensitive fields to prevent accidental PII/secret leakage */
export declare function sanitizeAttributes(raw: Record<string, unknown>): Record<string, string | number | boolean>;
export declare class ObservabilityService {
    private spans;
    private errorReports;
    private activeTraceId;
    startTrace(operation: string): {
        traceId: string;
        spanId: string;
    };
    endSpan(spanId: string, status: SpanStatus, attributes?: Record<string, unknown>): void;
    recordError(spanId: string, error: Error, attributes?: Record<string, unknown>): void;
    getSpan(spanId: string): TraceSpan | null;
    getErrorReports(): ErrorReport[];
    getSpanLatencyMs(spanId: string): number | null;
}
