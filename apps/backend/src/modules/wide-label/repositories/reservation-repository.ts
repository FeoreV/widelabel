import type { ReservationStatus } from "../models/reservation.js";

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
  findOpenByVariant(variantId: string): Promise<ReservationRecord | null>;
  findOpenByCart(cartId: string): Promise<ReservationRecord[]>;
  findExpired(now?: Date): Promise<ReservationRecord[]>;
  create(input: CreateReservationInput): Promise<ReservationRecord>;
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

export class InMemoryReservationRepository implements IReservationRepository {
  private reservations: Map<string, ReservationRecord> = new Map();

  async findById(id: string): Promise<ReservationRecord | null> {
    return this.reservations.get(id) || null;
  }

  async findOpenByVariant(variantId: string): Promise<ReservationRecord | null> {
    const now = new Date();
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

  async findOpenByCart(cartId: string): Promise<ReservationRecord[]> {
    const now = new Date();
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

  async create(input: CreateReservationInput): Promise<ReservationRecord> {
    const now = new Date();

    for (const res of this.reservations.values()) {
      if (
        res.variant_id === input.variant_id &&
        (res.status === "active" || res.status === "payment_pending") &&
        res.expires_at > now
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
