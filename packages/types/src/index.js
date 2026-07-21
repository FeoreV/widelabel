export function isBaseEntity(obj) {
    return typeof obj === "object" && obj !== null && "id" in obj;
}
export * from "./domain.js";
export * from "./dto.js";
export * from "./product.js";
export * from "./checkout.js";
