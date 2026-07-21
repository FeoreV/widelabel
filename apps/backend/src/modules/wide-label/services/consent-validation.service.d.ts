export interface LegalConsentInput {
    terms_accepted: boolean;
    privacy_accepted: boolean;
    consent_version: string;
}
export interface ConsentRecord {
    consent_version: string;
    accepted_at: string;
    consent_hash: string;
    terms_version: string;
    privacy_version: string;
}
export declare class InvalidConsentError extends Error {
    code: string;
    constructor(message: string);
}
export declare class ConsentValidationService {
    private activeVersion;
    validateAndRecord(input: LegalConsentInput): ConsentRecord;
    getActiveVersion(): string;
}
