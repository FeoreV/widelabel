import { createHash } from "node:crypto";
export class InvalidConsentError extends Error {
    code = "INVALID_CONSENT";
    constructor(message) {
        super(message);
        this.name = "InvalidConsentError";
    }
}
export class ConsentValidationService {
    activeVersion = "v1.0-2026-07";
    validateAndRecord(input) {
        if (!input.terms_accepted) {
            throw new InvalidConsentError("Terms and conditions must be explicitly accepted.");
        }
        if (!input.privacy_accepted) {
            throw new InvalidConsentError("Privacy policy must be explicitly accepted.");
        }
        if (!input.consent_version || input.consent_version !== this.activeVersion) {
            throw new InvalidConsentError(`Consent version '${input.consent_version}' is invalid or stale. Current active version: '${this.activeVersion}'.`);
        }
        const acceptedAt = new Date().toISOString();
        const hashPayload = `${input.consent_version}:${acceptedAt}:terms_accepted:privacy_accepted`;
        const consentHash = createHash("sha256").update(hashPayload).digest("hex");
        return {
            consent_version: input.consent_version,
            accepted_at: acceptedAt,
            consent_hash: consentHash,
            terms_version: "terms_v1_2026",
            privacy_version: "privacy_v1_2026",
        };
    }
    getActiveVersion() {
        return this.activeVersion;
    }
}
