import type pg from "pg";
import { getPgPool } from "../../../infra/db.ts";
import type { ReservationStatus } from "../models/reservation.ts";

export interface ReservationRecord {
  id: string;
  variant_id: string;
  cart_id: string;
  customer_id?: string | null;
  session_fingerprint?: string | null;
  status: ReservationStatus;
  reserved_at: Date;
  expires_at: Date;
  payment_pending_until?: Date | null;
  converted_at?: Date | null;
  released_at?: Date | null;
  release_reason?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateReservationInput {
  id?: string;
  variant_id: string;
  cart_id: string;
  customer_id?: string | null;
  session_fingerprint?: string | null;
  status?: ReservationStatus;
  reserved_at?: Date;
  expires_at: Date;
}

export interface IReservationRepository {
  findById(id: string): Promise<ReservationRecord | null>;
  findOpenByVariant(variantId: string, now?: Date): Promise<ReservationRecord | null>;
  findOpenByCart(cartId: string, now?: Date): Promise<ReservationRecord[]>;
  findExpired(now?: Date): Promise<ReservationRecord[]>;
  create(input: CreateReservationInput, now?: Date): Promise<ReservationRecord>;
  updateStatus(
    id: string,
    status: ReservationStatus,
    extra?: {
      payment_pending_until?: Date | null;
      converted_at?: Date | null;
      released_at?: Date | null;
      release_reason?: string | null;
    }
  ): Promise<ReservationRecord | null>;
}

export class PostgresReservationRepository implements IReservationRepository {
  private pool: pg.Pool;

  constructor(pool: pg.Pool = getPgPool()) {
    this.pool = pool;
  }

  private mapRow(row: any): ReservationRecord {
    return {
      id: row.id,
      variant_id: row.variant_id,
      cart_id: row.cart_id,
      customer_id: row.customer_id ?? null,
      session_fingerprint: row.session_fingerprint ?? null,
      status: row.status as ReservationStatus,
      reserved_at: new Date(row.reserved_at),
      expires_at: new Date(row.expires_at),
      payment_pending_until: row.payment_pending_until ? new Date(row.payment_pending_until) : null,
      converted_at: row.converted_at ? new Date(row.converted_at) : null,
      released_at: row.released_at ? new Date(row.released_at) : null,
      release_reason: row.release_reason ?? null,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  async findById(id: string): Promise<ReservationRecord | null> {
    const res = await this.pool.query(
      `SELECT * FROM wide_label_reservation WHERE id = $1`,
      [id]
    );
    if (res.rows.length === 0) return null;
    return this.mapRow(res.rows[0]);
  }

  async findOpenByVariant(variantId: string, now: Date = new Date()): Promise<ReservationRecord | null> {
    const res = await this.pool.query(
      `SELECT * FROM wide_label_reservation
       WHERE variant_id = $1
         AND status IN ('active', 'payment_pending')
         AND expires_at > $2
       LIMIT 1`,
      [variantId, now]
    );
    if (res.rows.length === 0) return null;
    return this.mapRow(res.rows[0]);
  }

  async findOpenByCart(cartId: string, now: Date = new Date()): Promise<ReservationRecord[]> {
    const res = await this.pool.query(
      `SELECT * FROM wide_label_reservation
       WHERE cart_id = $1
         AND status IN ('active', 'payment_pending')
         AND expires_at > $2
       ORDER BY reserved_at ASC`,
      [cartId, now]
    );
    return res.rows.map((r) => this.mapRow(r));
  }

  async findExpired(now: Date = new Date()): Promise<ReservationRecord[]> {
    const res = await this.pool.query(
      `SELECT * FROM wide_label_reservation
       WHERE status IN ('active', 'payment_pending')
         AND expires_at <= $1
       ORDER BY expires_at ASC`,
      [now]
    );
    return res.rows.map((r) => this.mapRow(r));
  }

  async create(input: CreateReservationInput, referenceNow: Date = new Date()): Promise<ReservationRecord> {
    const now = referenceNow;
    const status = input.status || "active";
    const reservedAt = input.reserved_at || now;

    const res = await this.pool.query(
      `INSERT INTO wide_label_reservation (
         ${input.id ? "id," : ""} variant_id, cart_id, customer_id, session_fingerprint, status, reserved_at, expires_at, created_at, updated_at
       ) VALUES (
         ${input.id ? "$1," : ""} ${input.id ? "$2" : "$1"}, ${input.id ? "$3" : "$2"}, ${input.id ? "$4" : "$3"}, ${input.id ? "$5" : "$4"}, ${input.id ? "$6" : "$5"}, ${input.id ? "$7" : "$6"}, ${input.id ? "$8" : "$7"}, ${input.id ? "$9" : "$8"}, ${input.id ? "$10" : "$9"}
       ) RETURNING *`,
      input.id
        ? [input.id, input.variant_id, input.cart_id, input.customer_id || null, input.session_fingerprint || null, status, reservedAt, input.expires_at, now, now]
        : [input.variant_id, input.cart_id, input.customer_id || null, input.session_fingerprint || null, status, reservedAt, input.expires_at, now, now]
    );

    return this.mapRow(res.rows[0]);
  }

  async updateStatus(
    id: string,
    status: ReservationStatus,
    extra?: {
      payment_pending_until?: Date | null;
      converted_at?: Date | null;
      released_at?: Date | null;
      release_reason?: string | null;
    }
  ): Promise<ReservationRecord | null> {
    const now = new Date();
    const existing = await this.findById(id);
    if (!existing) return null;

    const paymentPendingUntil = extra?.payment_pending_until !== undefined ? extra.payment_pending_until : existing.payment_pending_until;
    const convertedAt = extra?.converted_at !== undefined ? extra.converted_at : existing.converted_at;
    const releasedAt = extra?.released_at !== undefined ? extra.released_at : existing.released_at;
    const releaseReason = extra?.release_reason !== undefined ? extra.release_reason : existing.release_reason;

    const res = await this.pool.query(
      `UPDATE wide_label_reservation
       SET status = $1,
           payment_pending_until = $2,
           converted_at = $3,
           released_at = $4,
           release_reason = $5,
           updated_at = $6
       WHERE id = $7
       RETURNING *`,
      [status, paymentPendingUntil, convertedAt, releasedAt, releaseReason, now, id]
    );

    if (res.rows.length === 0) return null;
    return this.mapRow(res.rows[0]);
  }
}

export class InMemoryReservationRepository implements IReservationRepository {
  private reservations: Map<string, ReservationRecord> = new Map();

  async findById(id: string): Promise<ReservationRecord | null> {
    return this.reservations.get(id) || null;
  }

  async findOpenByVariant(variantId: string, now: Date = new Date()): Promise<ReservationRecord | null> {
    for (const res of this.reservations.values()) {
      if (
        res.variant_id === variantId &&
        (res.status === "active" || res.status === "payment_pending") &&
        res.expires_at > now
      ) {
        return res;
      }
    }
    return null;
  }

  async findOpenByCart(cartId: string, now: Date = new Date()): Promise<ReservationRecord[]> {
    const result: ReservationRecord[] = [];
    for (const res of this.reservations.values()) {
      if (
        res.cart_id === cartId &&
        (res.status === "active" || res.status === "payment_pending") &&
        res.expires_at > now
      ) {
        result.push(res);
      }
    }
    return result;
  }

  async findExpired(now: Date = new Date()): Promise<ReservationRecord[]> {
    const result: ReservationRecord[] = [];
    for (const res of this.reservations.values()) {
      if (
        (res.status === "active" || res.status === "payment_pending") &&
        res.expires_at <= now
      ) {
        result.push(res);
      }
    }
    return result;
  }

  async create(input: CreateReservationInput, referenceNow: Date = new Date()): Promise<ReservationRecord> {
    const now = referenceNow;
    for (const res of this.reservations.values()) {
      if (
        res.variant_id === input.variant_id &&
        (res.status === "active" || res.status === "payment_pending") &&
        res.expires_at > referenceNow
      ) {
        throw new Error(`Open reservation already exists for variant ${input.variant_id}`);
      }
    }

    const id = input.id || `res_${Math.random().toString(36).substring(2, 11)}`;
    const record: ReservationRecord = {
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

  async updateStatus(
    id: string,
    status: ReservationStatus,
    extra?: {
      payment_pending_until?: Date | null;
      converted_at?: Date | null;
      released_at?: Date | null;
      release_reason?: string | null;
    }
  ): Promise<ReservationRecord | null> {
    const record = this.reservations.get(id);
    if (!record) {
      return null;
    }

    const updated: ReservationRecord = {
      ...record,
      status,
      payment_pending_until:
        extra?.payment_pending_until !== undefined
          ? extra.payment_pending_until
          : record.payment_pending_until,
      converted_at:
        extra?.converted_at !== undefined
          ? extra.converted_at
          : record.converted_at,
      released_at:
        extra?.released_at !== undefined
          ? extra.released_at
          : record.released_at,
      release_reason:
        extra?.release_reason !== undefined
          ? extra.release_reason
          : record.release_reason,
      updated_at: new Date(),
    };

    this.reservations.set(id, updated);
    return updated;
  }
}
