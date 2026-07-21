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
export declare class YooKassaClient {
    private shopId;
    private secretKey;
    private baseUrl;
    constructor(shopId?: string, secretKey?: string, baseUrl?: string);
    private getAuthHeader;
    createPayment(input: CreateYooKassaPaymentInput): Promise<YooKassaPaymentObject>;
    getPayment(paymentId: string): Promise<YooKassaPaymentObject>;
    capturePayment(paymentId: string, amount?: {
        value: string;
        currency: string;
    }): Promise<YooKassaPaymentObject>;
    cancelPayment(paymentId: string): Promise<YooKassaPaymentObject>;
    refundPayment(paymentId: string, amount: {
        value: string;
        currency: string;
    }): Promise<YooKassaRefundObject>;
}
