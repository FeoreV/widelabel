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
export declare class AdminDropService {
    private drops;
    private dropProducts;
    createDrop(input: CreateDropInput): DropRecord;
    getDrop(id: string): DropRecord | null;
    listDrops(): DropRecord[];
    updateDrop(id: string, updates: Partial<Omit<CreateDropInput, "slug">>): DropRecord | null;
    deleteDrop(id: string): boolean;
    assignProductsToDrop(dropId: string, productIds: string[]): string[];
    getDropProducts(dropId: string): string[];
}
