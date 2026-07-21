export declare const DropStatusEnum: readonly ["draft", "scheduled", "live", "closed"];
export type DropStatus = (typeof DropStatusEnum)[number];
export declare const Drop: import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
    id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
    slug: import("@medusajs/framework/utils").TextProperty;
    title: import("@medusajs/framework/utils").TextProperty;
    description: import("@medusajs/framework/utils").TextProperty;
    status: import("@medusajs/framework/utils").EnumProperty<["draft", "scheduled", "live", "closed"]>;
    starts_at: import("@medusajs/framework/utils").NullableModifier<Date, import("@medusajs/framework/utils").DateTimeProperty>;
    ends_at: import("@medusajs/framework/utils").NullableModifier<Date, import("@medusajs/framework/utils").DateTimeProperty>;
    hero_image_key: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
    seo_title: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
    seo_description: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
}>, "wide_label_drop">;
export declare const DropProduct: import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
    drop_id: import("@medusajs/framework/utils").TextProperty;
    product_id: import("@medusajs/framework/utils").TextProperty;
    sort_order: import("@medusajs/framework/utils").NumberProperty;
}>, "wide_label_drop_product">;
