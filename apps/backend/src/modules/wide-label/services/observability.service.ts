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
export function sanitizeAttributes(
  raw: Record<string, unknown>
): Record<string, string | number | boolean> {
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

  const result: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(raw)) {
    const lk = key.toLowerCase();
    if (BLOCKED_KEYS.has(lk) || lk.includes("secret") || lk.includes("token") || lk.includes("key")) {
      result[key] = "[REDACTED]";
    } else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      result[key] = value;
    } else {
      result[key] = String(value);
    }
  }
  return result;
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(16)}_${Math.random().toString(36).substring(2, 8)}`;
}

export class ObservabilityService {
  private spans: TraceSpan[] = [];
  private errorReports: ErrorReport[] = [];
  private activeTraceId: string | null = null;

  public startTrace(operation: string): { traceId: string; spanId: string } {
    const traceId = generateId("tr");
    const spanId = generateId("sp");
    this.activeTraceId = traceId;

    const span: TraceSpan = {
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

  public endSpan(spanId: string, status: SpanStatus, attributes: Record<string, unknown> = {}): void {
    const span = this.spans.find((s) => s.spanId === spanId);
    if (!span) return;

    span.endMs = Date.now();
    span.status = status;
    span.attributes = { ...span.attributes, ...sanitizeAttributes(attributes) };
  }

  public recordError(
    spanId: string,
    error: Error,
    attributes: Record<string, unknown> = {}
  ): void {
    const span = this.spans.find((s) => s.spanId === spanId);
    if (!span) return;

    span.status = "error";
    span.attributes = { ...span.attributes, ...sanitizeAttributes(attributes) };
    span.errorCode = (error as any).code || "UNKNOWN_ERROR";

    const report: ErrorReport = {
      traceId: span.traceId,
      spanId: span.spanId,
      operation: span.operation,
      errorCode: span.errorCode!,
      message: error.message,
      timestamp: new Date(),
    };
    this.errorReports.push(report);
  }

  public getSpan(spanId: string): TraceSpan | null {
    return this.spans.find((s) => s.spanId === spanId) || null;
  }

  public getErrorReports(): ErrorReport[] {
    return [...this.errorReports];
  }

  public getSpanLatencyMs(spanId: string): number | null {
    const span = this.spans.find((s) => s.spanId === spanId);
    if (!span || span.endMs === undefined) return null;
    return span.endMs - span.startMs;
  }
}
