export class CdekAuthClient {
    clientId;
    clientSecret;
    baseUrl;
    cachedToken = null;
    tokenExpiresAtMs = 0;
    constructor(clientId = process.env.CDEK_CLIENT_ID || "test_cdek_id", clientSecret = process.env.CDEK_CLIENT_SECRET || "test_cdek_secret", baseUrl = process.env.CDEK_BASE_URL || "https://api.cdek.ru") {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.baseUrl = baseUrl.replace(/\/$/, "");
    }
    async getAccessToken() {
        const now = Date.now();
        // Cache buffer of 60 seconds
        if (this.cachedToken && now < this.tokenExpiresAtMs - 60000) {
            return this.cachedToken;
        }
        const params = new URLSearchParams({
            grant_type: "client_credentials",
            client_id: this.clientId,
            client_secret: this.clientSecret,
        });
        const response = await fetch(`${this.baseUrl}/v2/oauth/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        });
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`CDEK OAuth token request failed (${response.status}): ${errText}`);
        }
        const data = await response.json();
        this.cachedToken = data.access_token;
        this.tokenExpiresAtMs = Date.now() + data.expires_in * 1000;
        return this.cachedToken;
    }
    clearCache() {
        this.cachedToken = null;
        this.tokenExpiresAtMs = 0;
    }
}
