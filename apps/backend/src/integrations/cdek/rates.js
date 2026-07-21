export class CdekRateAdapter {
    authClient;
    baseUrl;
    constructor(authClient, baseUrl = process.env.CDEK_BASE_URL || "https://api.cdek.ru") {
        this.authClient = authClient;
        this.baseUrl = baseUrl.replace(/\/$/, "");
    }
    async calculateRate(input) {
        const token = await this.authClient.getAccessToken();
        const response = await fetch(`${this.baseUrl}/v2/calculator/tariff`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(input),
        });
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`CDEK calculateRate failed (${response.status}): ${errText}`);
        }
        const data = await response.json();
        return {
            delivery_sum: data.delivery_sum,
            period_min: data.period_min,
            period_max: data.period_max,
            weight_calc: data.weight_calc,
            total_sum: data.total_sum || data.delivery_sum,
            currency: data.currency || "RUB",
        };
    }
}
