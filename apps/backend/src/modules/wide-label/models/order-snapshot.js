export class OrderSnapshotImmutableError extends Error {
    code = "SNAPSHOT_IMMUTABLE";
    constructor(message = "OrderSnapshot is immutable after creation") {
        super(message);
        this.name = "OrderSnapshotImmutableError";
    }
}
export class OrderSnapshotRepository {
    snapshots = new Map();
    create(snapshot) {
        if (this.snapshots.has(snapshot.id)) {
            throw new Error(`OrderSnapshot with ID ${snapshot.id} already exists`);
        }
        const stored = Object.freeze({ ...snapshot });
        this.snapshots.set(snapshot.id, stored);
        return stored;
    }
    findById(id) {
        return this.snapshots.get(id) || null;
    }
    findByOrderId(orderId) {
        return Array.from(this.snapshots.values()).filter((s) => s.order_id === orderId);
    }
    update() {
        throw new OrderSnapshotImmutableError();
    }
}
