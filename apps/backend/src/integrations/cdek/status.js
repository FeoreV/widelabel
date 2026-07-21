export class CdekStatusAdapter {
    authClient;
    baseUrl;
    constructor(authClient, baseUrl = process.env.CDEK_BASE_URL || "https://api.cdek.ru") {
        this.authClient = authClient;
        this.baseUrl = baseUrl.replace(/\/$/, "");
    }
    async getShipmentStatus(cdekOrderUuid) {
        const token = await this.authClient.getAccessToken();
        const response = await fetch(`${this.baseUrl}/v2/orders/${cdekOrderUuid}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`CDEK getShipmentStatus failed (${response.status}): ${errText}`);
        }
        const data = await response.json();
        const entity = data.entity || {};
        const statuses = entity.statuses || [];
        const latestStatus = statuses[statuses.length - 1] || {};
        const rawCode = latestStatus.code || entity.status || "CREATED";
        return {
            cdek_order_uuid: cdekOrderUuid,
            cdek_status_code: rawCode,
            cdek_status_name: latestStatus.name,
            fulfillment_status: this.mapCdekStatusToFulfillmentStatus(rawCode),
            status_date: latestStatus.date_time || new Date().toISOString(),
        };
    }
    mapCdekStatusToFulfillmentStatus(cdekStatusCode) {
        const code = cdekStatusCode.toUpperCase();
        switch (code) {
            case "CREATED":
            case "ACCEPTED":
                return "created";
            case "TAKEN":
            case "ACCEPTED_AT_STOCK":
            case "SENT":
            case "TRANSIT":
                return "in_transit";
            case "READY_FOR_DELIVERY":
            case "ACCEPTED_AT_PICK_UP_POINT":
                return "ready_for_pickup";
            case "DELIVERED":
            case "HANDED":
                return "delivered";
            case "NOT_DELIVERED":
            case "RETURNED":
                return "failed";
            case "CANCELED":
            case "DELETED":
                return "canceled";
            default:
                return "in_transit";
        }
    }
}
