export interface CdekTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
    jti: string;
}
export declare class CdekAuthClient {
    private clientId;
    private clientSecret;
    private baseUrl;
    private cachedToken;
    private tokenExpiresAtMs;
    constructor(clientId?: string, clientSecret?: string, baseUrl?: string);
    getAccessToken(): Promise<string>;
    clearCache(): void;
}
