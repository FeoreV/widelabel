export class AdminDropService {
    drops = new Map();
    dropProducts = new Map(); // dropId -> Set<productId>
    createDrop(input) {
        const id = `drop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const record = {
            id,
            title: input.title,
            slug: input.slug,
            starts_at: input.starts_at,
            ends_at: input.ends_at ?? null,
            status: input.status || "draft",
            created_at: new Date(),
            updated_at: new Date(),
        };
        this.drops.set(id, record);
        this.dropProducts.set(id, new Set());
        return record;
    }
    getDrop(id) {
        return this.drops.get(id) || null;
    }
    listDrops() {
        return Array.from(this.drops.values());
    }
    updateDrop(id, updates) {
        const existing = this.drops.get(id);
        if (!existing)
            return null;
        const updated = {
            ...existing,
            title: updates.title !== undefined ? updates.title : existing.title,
            starts_at: updates.starts_at !== undefined ? updates.starts_at : existing.starts_at,
            ends_at: updates.ends_at !== undefined ? updates.ends_at : existing.ends_at,
            status: updates.status !== undefined ? updates.status : existing.status,
            updated_at: new Date(),
        };
        this.drops.set(id, updated);
        return updated;
    }
    deleteDrop(id) {
        this.dropProducts.delete(id);
        return this.drops.delete(id);
    }
    assignProductsToDrop(dropId, productIds) {
        const existingDrop = this.drops.get(dropId);
        if (!existingDrop) {
            throw new Error(`Drop with ID ${dropId} not found`);
        }
        const currentSet = this.dropProducts.get(dropId) || new Set();
        for (const pid of productIds) {
            currentSet.add(pid);
        }
        this.dropProducts.set(dropId, currentSet);
        return Array.from(currentSet);
    }
    getDropProducts(dropId) {
        const currentSet = this.dropProducts.get(dropId);
        return currentSet ? Array.from(currentSet) : [];
    }
}
