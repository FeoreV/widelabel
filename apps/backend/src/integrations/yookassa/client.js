export class YooKassaClient {
    shopId;
    secretKey;
    baseUrl;
    constructor(shopId = process.env.YOOKASSA_SHOP_ID || "test_shop_id", secretKey = process.env.YOOKASSA_SECRET_KEY || "test_secret_key", baseUrl = process.env.YOOKASSA_BASE_URL || "https://api.yookassa.ru/v3") {
        this.shopId = shopId;
        this.secretKey = secretKey;
        this.baseUrl = baseUrl.replace(/\/$/, "");
    }
    getAuthHeader() {
        const authString = `${this.shopId}:${this.secretKey}`;
        return `Basic ${Buffer.from(authString).toString("base64")}`;
    }
    async createPayment(input) {
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
    async getPayment(paymentId) {
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
    async capturePayment(paymentId, amount) {
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
    async cancelPayment(paymentId) {
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
    async refundPayment(paymentId, amount) {
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
