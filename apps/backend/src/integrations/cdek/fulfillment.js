export class CdekFulfillmentAdapter {
    authClient;
    baseUrl;
    createdShipments = new Map();
    constructor(authClient, baseUrl = process.env.CDEK_BASE_URL || "https://api.cdek.ru") {
        this.authClient = authClient;
        this.baseUrl = baseUrl.replace(/\/$/, "");
    }
    async createShipmentOrder(input) {
        // Idempotency: Return existing shipment if already registered for order_number
        if (this.createdShipments.has(input.order_number)) {
            return this.createdShipments.get(input.order_number);
        }
        const token = await this.authClient.getAccessToken();
        const response = await fetch(`${this.baseUrl}/v2/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                number: input.order_number,
                tariff_code: input.tariff_code,
                sender: input.sender,
                recipient: input.recipient,
                from_location: input.from_location,
                to_location: input.to_location,
                packages: input.packages,
                comment: input.comment,
            }),
        });
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`CDEK createShipmentOrder failed (${response.status}): ${errText}`);
        }
        const data = await response.json();
        const result = {
            cdek_order_uuid: data.entity?.uuid || data.uuid || `cdek_uuid_${Date.now()}`,
            order_number: input.order_number,
            status: "ACCEPTED",
            created_at: new Date().toISOString(),
        };
        this.createdShipments.set(input.order_number, result);
        return result;
    }
}
