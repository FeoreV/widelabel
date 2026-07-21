export class DuplicateIdempotencyKeyError extends Error {
    code = "DUPLICATE_IDEMPOTENCY_KEY";
    constructor(key) {
        super(`PaymentAttempt with idempotency_key '${key}' already exists`);
        this.name = "DuplicateIdempotencyKeyError";
    }
}
export class InMemoryPaymentAttemptRepository {
    attemptsById = new Map();
    attemptsByIdempotencyKey = new Map();
    create(attempt) {
        if (this.attemptsByIdempotencyKey.has(attempt.idempotency_key)) {
            throw new DuplicateIdempotencyKeyError(attempt.idempotency_key);
        }
        const stored = { ...attempt };
        this.attemptsById.set(attempt.id, stored);
        this.attemptsByIdempotencyKey.set(attempt.idempotency_key, stored);
        return stored;
    }
    findByIdempotencyKey(key) {
        return this.attemptsByIdempotencyKey.get(key) || null;
    }
    findById(id) {
        return this.attemptsById.get(id) || null;
    }
    updateStatus(id, status, externalPaymentId) {
        const attempt = this.attemptsById.get(id);
        if (!attempt) {
            throw new Error(`PaymentAttempt ${id} not found`);
        }
        attempt.status = status;
        if (externalPaymentId !== undefined) {
            attempt.external_payment_id = externalPaymentId;
        }
        attempt.updated_at = new Date();
        return attempt;
    }
}
