import type { Measurements, Defect } from "@wide-label/types";

export interface OrderSnapshot {
  id: string;
  order_id: string;
  variant_id: string;
  title: string;
  price: number;
  currency_code: string;
  measurements: Measurements;
  defects: Defect[];
  media_checksums: Record<string, string>;
  consent_version: string;
  created_at: Date;
}

export class OrderSnapshotImmutableError extends Error {
  public code = "SNAPSHOT_IMMUTABLE";
  constructor(message = "OrderSnapshot is immutable after creation") {
    super(message);
    this.name = "OrderSnapshotImmutableError";
  }
}

export class OrderSnapshotRepository {
  private snapshots = new Map<string, OrderSnapshot>();

  public create(snapshot: OrderSnapshot): OrderSnapshot {
    if (this.snapshots.has(snapshot.id)) {
      throw new Error(`OrderSnapshot with ID ${snapshot.id} already exists`);
    }
    const stored = Object.freeze({ ...snapshot });
    this.snapshots.set(snapshot.id, stored);
    return stored;
  }

  public findById(id: string): OrderSnapshot | null {
    return this.snapshots.get(id) || null;
  }

  public findByOrderId(orderId: string): OrderSnapshot[] {
    return Array.from(this.snapshots.values()).filter(
      (s) => s.order_id === orderId
    );
  }

  public update(): never {
    throw new OrderSnapshotImmutableError();
  }
}
