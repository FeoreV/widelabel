import type pg from "pg";
import { getPgPool } from "../../../infra/db.ts";
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

export interface IOrderSnapshotRepository {
  create(snapshot: OrderSnapshot): Promise<OrderSnapshot> | OrderSnapshot;
  findById(id: string): Promise<OrderSnapshot | null> | OrderSnapshot | null;
  findByOrderId(orderId: string): Promise<OrderSnapshot[]> | OrderSnapshot[];
  update(): never;
}

export class PostgresOrderSnapshotRepository implements IOrderSnapshotRepository {
  private pool: pg.Pool;

  constructor(pool: pg.Pool = getPgPool()) {
    this.pool = pool;
  }

  private mapRow(row: any): OrderSnapshot {
    return {
      id: row.id,
      order_id: row.order_id,
      variant_id: row.variant_id,
      title: row.title,
      price: Number(row.price_amount),
      currency_code: row.currency_code.trim(),
      measurements: typeof row.measurements_json === "string" ? JSON.parse(row.measurements_json) : row.measurements_json,
      defects: typeof row.defects_json === "string" ? JSON.parse(row.defects_json) : row.defects_json,
      media_checksums: typeof row.media_json === "string" ? JSON.parse(row.media_json) : row.media_json,
      consent_version: row.consent_version,
      created_at: new Date(row.created_at),
    };
  }

  public async create(snapshot: OrderSnapshot): Promise<OrderSnapshot> {
    const now = snapshot.created_at || new Date();
    const res = await this.pool.query(
      `INSERT INTO wide_label_order_snapshot (
         ${snapshot.id ? "id," : ""} order_id, variant_id, product_id, item_id, title, defects_json, measurements_json, media_json, price_amount, currency_code, consent_text, consent_version, consent_accepted_at, created_at
       ) VALUES (
         ${snapshot.id ? "$1," : ""} ${snapshot.id ? "$2" : "$1"}, ${snapshot.id ? "$3" : "$2"}, ${snapshot.id ? "$4" : "$3"}, ${snapshot.id ? "$5" : "$4"}, ${snapshot.id ? "$6" : "$5"}, ${snapshot.id ? "$7" : "$6"}, ${snapshot.id ? "$8" : "$7"}, ${snapshot.id ? "$9" : "$8"}, ${snapshot.id ? "$10" : "$9"}, ${snapshot.id ? "$11" : "$10"}, ${snapshot.id ? "$12" : "$11"}, ${snapshot.id ? "$13" : "$12"}, ${snapshot.id ? "$14" : "$13"}, ${snapshot.id ? "$15" : "$14"}
       ) RETURNING *`,
      snapshot.id
        ? [snapshot.id, snapshot.order_id, snapshot.variant_id, snapshot.variant_id, snapshot.variant_id, snapshot.title, JSON.stringify(snapshot.defects), JSON.stringify(snapshot.measurements), JSON.stringify(snapshot.media_checksums), snapshot.price, snapshot.currency_code, "Consent Terms", snapshot.consent_version, now, now]
        : [snapshot.order_id, snapshot.variant_id, snapshot.variant_id, snapshot.variant_id, snapshot.title, JSON.stringify(snapshot.defects), JSON.stringify(snapshot.measurements), JSON.stringify(snapshot.media_checksums), snapshot.price, snapshot.currency_code, "Consent Terms", snapshot.consent_version, now, now]
    );

    return this.mapRow(res.rows[0]);
  }

  public async findById(id: string): Promise<OrderSnapshot | null> {
    const res = await this.pool.query(
      `SELECT * FROM wide_label_order_snapshot WHERE id = $1`,
      [id]
    );
    if (res.rows.length === 0) return null;
    return this.mapRow(res.rows[0]);
  }

  public async findByOrderId(orderId: string): Promise<OrderSnapshot[]> {
    const res = await this.pool.query(
      `SELECT * FROM wide_label_order_snapshot WHERE order_id = $1`,
      [orderId]
    );
    return res.rows.map((r) => this.mapRow(r));
  }

  public update(): never {
    throw new OrderSnapshotImmutableError();
  }
}

export class OrderSnapshotRepository implements IOrderSnapshotRepository {
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
