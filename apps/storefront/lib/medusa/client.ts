import type {
  AvailabilityResponse,
  CartHoldRequest,
  CartHoldResponse,
  ErrorResponse,
} from "@wide-label/types";

export class MedusaClientError extends Error {
  readonly code: string;
  readonly retryable: boolean;

  constructor(errorResponse: ErrorResponse) {
    super(errorResponse.message);
    this.name = "MedusaClientError";
    this.code = errorResponse.code;
    this.retryable = errorResponse.retryable;
  }
}

export class MedusaStorefrontClient {
  private baseUrl: string;

  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000"
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const publishableKey =
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
      process.env.MEDUSA_PUBLISHABLE_KEY ||
      "pk_0f5bfcffb9885273914dc748f5afa0a5f8ffd41557ea1b9631422069f1c81989";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (publishableKey) {
      headers["x-publishable-api-key"] = publishableKey;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: ErrorResponse;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          code: "UNKNOWN_ERROR",
          message: `HTTP ${response.status} ${response.statusText}`,
          retryable: response.status >= 500,
        };
      }
      throw new MedusaClientError(errorData);
    }

    return response.json();
  }

  async getAvailability(variantId: string): Promise<AvailabilityResponse> {
    return this.request<AvailabilityResponse>(
      `/store/wide-label/products/${encodeURIComponent(variantId)}/availability`
    );
  }

  async holdCartItem(payload: CartHoldRequest): Promise<CartHoldResponse> {
    return this.request<CartHoldResponse>("/store/wide-label/cart/hold", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}
