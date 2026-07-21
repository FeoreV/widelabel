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
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
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
