export interface CreateYooKassaPaymentInput {
  amount: {
    value: string;
    currency: string;
  };
  confirmation: {
    type: "redirect";
    return_url: string;
  };
  capture: boolean;
  description?: string;
  idempotency_key: string;
  metadata?: Record<string, string>;
}

export interface YooKassaPaymentObject {
  id: string;
  status: "pending" | "waiting_for_capture" | "succeeded" | "canceled";
  paid: boolean;
  amount: {
    value: string;
    currency: string;
  };
  confirmation?: {
    type: "redirect";
    confirmation_url: string;
  };
  created_at: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface YooKassaRefundObject {
  id: string;
  payment_id: string;
  status: "succeeded";
  amount: {
    value: string;
    currency: string;
  };
  created_at: string;
}

export class YooKassaClient {
  private shopId: string;
  private secretKey: string;
  private baseUrl: string;

  constructor(
    shopId: string = process.env.YOOKASSA_SHOP_ID || "test_shop_id",
    secretKey: string = process.env.YOOKASSA_SECRET_KEY || "test_secret_key",
    baseUrl: string = process.env.YOOKASSA_BASE_URL || "https://api.yookassa.ru/v3"
  ) {
    this.shopId = shopId;
    this.secretKey = secretKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private getAuthHeader(): string {
    const authString = `${this.shopId}:${this.secretKey}`;
    return `Basic ${Buffer.from(authString).toString("base64")}`;
  }

  public async createPayment(
    input: CreateYooKassaPaymentInput
  ): Promise<YooKassaPaymentObject> {
    const response = await fetch(`${this.baseUrl}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": input.idempotency_key,
        Authorization: this.getAuthHeader(),
      },
      body: JSON.stringify({
        amount: input.amount,
        confirmation: input.confirmation,
        capture: input.capture,
        description: input.description,
        metadata: input.metadata,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`YooKassa createPayment failed (${response.status}): ${errText}`);
    }

    return response.json();
  }

  public async getPayment(paymentId: string): Promise<YooKassaPaymentObject> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
      method: "GET",
      headers: {
        Authorization: this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`YooKassa getPayment failed (${response.status}): ${errText}`);
    }

    return response.json();
  }

  public async capturePayment(
    paymentId: string,
    amount?: { value: string; currency: string }
  ): Promise<YooKassaPaymentObject> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": `cap_${paymentId}_${Date.now()}`,
        Authorization: this.getAuthHeader(),
      },
      body: JSON.stringify(amount ? { amount } : {}),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`YooKassa capturePayment failed (${response.status}): ${errText}`);
    }

    return response.json();
  }

  public async cancelPayment(paymentId: string): Promise<YooKassaPaymentObject> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": `can_${paymentId}_${Date.now()}`,
        Authorization: this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`YooKassa cancelPayment failed (${response.status}): ${errText}`);
    }

    return response.json();
  }

  public async refundPayment(
    paymentId: string,
    amount: { value: string; currency: string }
  ): Promise<YooKassaRefundObject> {
    const response = await fetch(`${this.baseUrl}/refunds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": `ref_${paymentId}_${Date.now()}`,
        Authorization: this.getAuthHeader(),
      },
      body: JSON.stringify({
        payment_id: paymentId,
        amount,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`YooKassa refundPayment failed (${response.status}): ${errText}`);
    }

    return response.json();
  }
}
