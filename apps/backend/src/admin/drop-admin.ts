import type pg from "pg";
import { getPgPool } from "../infra/db.ts";

export type DropStatus = "draft" | "scheduled" | "active" | "ended" | "archived" | "live" | "closed";

export interface DropRecord {
  id: string;
  title: string;
  slug: string;
  starts_at: Date;
  ends_at?: Date | null;
  status: DropStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDropInput {
  title: string;
  slug: string;
  starts_at: Date;
  ends_at?: Date | null;
  status?: DropStatus;
}

export interface IAdminDropService {
  createDrop(input: CreateDropInput): Promise<DropRecord> | DropRecord;
  getDrop(id: string): Promise<DropRecord | null> | DropRecord | null;
  listDrops(): Promise<DropRecord[]> | DropRecord[];
  updateDrop(id: string, updates: Partial<Omit<CreateDropInput, "slug">>): Promise<DropRecord | null> | DropRecord | null;
  deleteDrop(id: string): Promise<boolean> | boolean;
  assignProductsToDrop(dropId: string, productIds: string[]): Promise<string[]> | string[];
  getDropProducts(dropId: string): Promise<string[]> | string[];
}

export class PostgresAdminDropService implements IAdminDropService {
  private pool: pg.Pool;

  constructor(pool: pg.Pool = getPgPool()) {
    this.pool = pool;
  }

  private mapRow(row: any): DropRecord {
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      starts_at: row.starts_at ? new Date(row.starts_at) : new Date(),
      ends_at: row.ends_at ? new Date(row.ends_at) : null,
      status: row.status as DropStatus,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  public async createDrop(input: CreateDropInput): Promise<DropRecord> {
    const now = new Date();
    const dbStatus = input.status === "active" ? "live" : input.status === "ended" ? "closed" : (input.status || "draft");

    const res = await this.pool.query(
      `INSERT INTO wide_label_drop (
         title, slug, status, starts_at, ends_at, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7
       ) RETURNING *`,
      [input.title, input.slug, dbStatus, input.starts_at, input.ends_at || null, now, now]
    );

    return this.mapRow(res.rows[0]);
  }

  public async getDrop(id: string): Promise<DropRecord | null> {
    const res = await this.pool.query(
      `SELECT * FROM wide_label_drop WHERE id::text = $1 OR slug = $1`,
      [id]
    );
    if (res.rows.length === 0) return null;
    return this.mapRow(res.rows[0]);
  }

  public async listDrops(): Promise<DropRecord[]> {
    const res = await this.pool.query(
      `SELECT * FROM wide_label_drop ORDER BY created_at DESC`
    );
    return res.rows.map((r) => this.mapRow(r));
  }

  public async updateDrop(
    id: string,
    updates: Partial<Omit<CreateDropInput, "slug">>
  ): Promise<DropRecord | null> {
    const existing = await this.getDrop(id);
    if (!existing) return null;

    const title = updates.title !== undefined ? updates.title : existing.title;
    const startsAt = updates.starts_at !== undefined ? updates.starts_at : existing.starts_at;
    const endsAt = updates.ends_at !== undefined ? updates.ends_at : existing.ends_at;
    const dbStatus = updates.status !== undefined
      ? (updates.status === "active" ? "live" : updates.status === "ended" ? "closed" : updates.status)
      : existing.status;
    const now = new Date();

    const res = await this.pool.query(
      `UPDATE wide_label_drop
       SET title = $1, starts_at = $2, ends_at = $3, status = $4, updated_at = $5
       WHERE id::text = $6 OR slug = $6
       RETURNING *`,
      [title, startsAt, endsAt, dbStatus, now, id]
    );

    if (res.rows.length === 0) return null;
    return this.mapRow(res.rows[0]);
  }

  public async deleteDrop(id: string): Promise<boolean> {
    const res = await this.pool.query(
      `DELETE FROM wide_label_drop WHERE id::text = $1 OR slug = $1`,
      [id]
    );
    return (res.rowCount ?? 0) > 0;
  }

  public async assignProductsToDrop(dropId: string, productIds: string[]): Promise<string[]> {
    const existingDrop = await this.getDrop(dropId);
    if (!existingDrop) {
      throw new Error(`Drop with ID ${dropId} not found`);
    }

    for (let i = 0; i < productIds.length; i++) {
      await this.pool.query(
        `INSERT INTO wide_label_drop_product (drop_id, product_id, sort_order)
         VALUES ($1::uuid, $2, $3)
         ON CONFLICT (drop_id, product_id) DO UPDATE SET sort_order = EXCLUDED.sort_order`,
        [existingDrop.id, productIds[i], i]
      );
    }

    return this.getDropProducts(dropId);
  }

  public async getDropProducts(dropId: string): Promise<string[]> {
    const existingDrop = await this.getDrop(dropId);
    if (!existingDrop) return [];

    const res = await this.pool.query(
      `SELECT product_id FROM wide_label_drop_product WHERE drop_id::text = $1 ORDER BY sort_order ASC`,
      [existingDrop.id]
    );
    return res.rows.map((r) => r.product_id);
  }
}

export class InMemoryAdminDropService implements IAdminDropService {
  private drops = new Map<string, DropRecord>();
  private dropProducts = new Map<string, Set<string>>();

  public createDrop(input: CreateDropInput): DropRecord {
    const id = `drop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const record: DropRecord = {
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

  public getDrop(id: string): DropRecord | null {
    return this.drops.get(id) || null;
  }

  public listDrops(): DropRecord[] {
    return Array.from(this.drops.values());
  }

  public updateDrop(
    id: string,
    updates: Partial<Omit<CreateDropInput, "slug">>
  ): DropRecord | null {
    const existing = this.drops.get(id);
    if (!existing) return null;

    const updated: DropRecord = {
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

  public deleteDrop(id: string): boolean {
    this.dropProducts.delete(id);
    return this.drops.delete(id);
  }

  public assignProductsToDrop(dropId: string, productIds: string[]): string[] {
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

  public getDropProducts(dropId: string): string[] {
    const currentSet = this.dropProducts.get(dropId);
    return currentSet ? Array.from(currentSet) : [];
  }
}

export const AdminDropService = PostgresAdminDropService;
