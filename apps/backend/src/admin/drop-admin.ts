export type DropStatus = "draft" | "scheduled" | "active" | "ended" | "archived";

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

export class AdminDropService {
  private drops = new Map<string, DropRecord>();
  private dropProducts = new Map<string, Set<string>>(); // dropId -> Set<productId>

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
