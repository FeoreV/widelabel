export class CdekPvzAdapter {
    authClient;
    baseUrl;
    constructor(authClient, baseUrl = process.env.CDEK_BASE_URL || "https://api.cdek.ru") {
        this.authClient = authClient;
        this.baseUrl = baseUrl.replace(/\/$/, "");
    }
    async getPvzsByCity(cityCode) {
        const token = await this.authClient.getAccessToken();
        const response = await fetch(`${this.baseUrl}/v2/deliverypoints?city_code=${cityCode}&type=PVZ`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`CDEK getPvzsByCity failed (${response.status}): ${errText}`);
        }
        return response.json();
    }
    async validatePvzCode(pvzCode) {
        const token = await this.authClient.getAccessToken();
        const response = await fetch(`${this.baseUrl}/v2/deliverypoints?code=${pvzCode}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            return null;
        }
        const points = await response.json();
        return points.find((p) => p.code === pvzCode) || null;
    }
    async createPvzDestinationSnapshot(pvzCode) {
        const pvz = await this.validatePvzCode(pvzCode);
        if (!pvz) {
            throw new Error(`Invalid or inactive CDEK PVZ code: ${pvzCode}`);
        }
        return {
            pvz_code: pvz.code,
            name: pvz.name,
            city_code: pvz.location.city_code,
            city: pvz.location.city,
            address: pvz.location.address,
            postal_code: pvz.location.postal_code,
            work_time: pvz.work_time,
            phone: pvz.phones?.[0]?.number,
            snapshot_at: new Date().toISOString(),
        };
    }
}
