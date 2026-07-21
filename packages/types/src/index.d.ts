export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare function isBaseEntity(obj: unknown): obj is BaseEntity;
export * from "./domain.js";
export * from "./dto.js";
export * from "./product.js";
export * from "./checkout.js";
