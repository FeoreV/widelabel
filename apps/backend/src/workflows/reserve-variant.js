export const HOLD_DURATION_MS = 15 * 60 * 1000; // 15 minutes
export class ItemHeldError extends Error {
    code = "ITEM_HELD";
    retryable = false;
    constructor(message = "Item is temporarily reserved by another customer.") {
        super(message);
        this.name = "ItemHeldError";
    }
}
export async function reserveVariantWorkflow(repository, input, now = new Date()) {
    const existingOpen = await repository.findOpenByVariant(input.variant_id);
    if (existingOpen) {
        if (existingOpen.cart_id === input.cart_id) {
            // Idempotent same-cart retry: return existing reservation without extending expiry
            return existingOpen;
        }
        throw new ItemHeldError();
    }
    const expiresAt = new Date(now.getTime() + HOLD_DURATION_MS);
    try {
        return await repository.create({
            variant_id: input.variant_id,
            cart_id: input.cart_id,
            customer_id: input.customer_id,
            session_fingerprint: input.session_fingerprint,
            status: "active",
            reserved_at: now,
            expires_at: expiresAt,
        });
    }
    catch (err) {
        if (err.message && err.message.includes("Open reservation already exists")) {
            throw new ItemHeldError();
        }
        throw err;
    }
}
