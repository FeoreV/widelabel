export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export function isBaseEntity(obj: unknown): obj is BaseEntity {
  return typeof obj === "object" && obj !== null && "id" in obj;
}

export * from "./domain.js";
export * from "./dto.js";
export * from "./product.js";
export * from "./checkout.js";
