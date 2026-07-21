export class InMemoryReservationRepository {
    reservations = new Map();
    async findById(id) {
        return this.reservations.get(id) || null;
    }
    async findOpenByVariant(variantId) {
        const now = new Date();
        for (const res of this.reservations.values()) {
            if (res.variant_id === variantId &&
                (res.status === "active" || res.status === "payment_pending") &&
                res.expires_at > now) {
                return res;
            }
        }
        return null;
    }
    async findOpenByCart(cartId) {
        const now = new Date();
        const result = [];
        for (const res of this.reservations.values()) {
            if (res.cart_id === cartId &&
                (res.status === "active" || res.status === "payment_pending") &&
                res.expires_at > now) {
                result.push(res);
            }
        }
        return result;
    }
    async findExpired(now = new Date()) {
        const result = [];
        for (const res of this.reservations.values()) {
            if ((res.status === "active" || res.status === "payment_pending") &&
                res.expires_at <= now) {
                result.push(res);
            }
        }
        return result;
    }
    async create(input) {
        const now = new Date();
        for (const res of this.reservations.values()) {
            if (res.variant_id === input.variant_id &&
                (res.status === "active" || res.status === "payment_pending") &&
                res.expires_at > now) {
                throw new Error(`Open reservation already exists for variant ${input.variant_id}`);
            }
        }
        const id = input.id || `res_${Math.random().toString(36).substring(2, 11)}`;
        const record = {
            id,
            variant_id: input.variant_id,
            cart_id: input.cart_id,
            customer_id: input.customer_id ?? null,
            session_fingerprint: input.session_fingerprint ?? null,
            status: input.status || "active",
            reserved_at: input.reserved_at || now,
            expires_at: input.expires_at,
            payment_pending_until: null,
            converted_at: null,
            released_at: null,
            release_reason: null,
            created_at: now,
            updated_at: now,
        };
        this.reservations.set(id, record);
        return record;
    }
    async updateStatus(id, status, extra) {
        const record = this.reservations.get(id);
        if (!record) {
            return null;
        }
        const updated = {
            ...record,
            status,
            payment_pending_until: extra?.payment_pending_until !== undefined
                ? extra.payment_pending_until
                : record.payment_pending_until,
            converted_at: extra?.converted_at !== undefined
                ? extra.converted_at
                : record.converted_at,
            released_at: extra?.released_at !== undefined
                ? extra.released_at
                : record.released_at,
            release_reason: extra?.release_reason !== undefined
                ? extra.release_reason
                : record.release_reason,
            updated_at: new Date(),
        };
        this.reservations.set(id, updated);
        return updated;
    }
}
