export declare const ReservationStatusEnum: readonly ["active", "payment_pending", "released", "expired", "converted", "cancelled"];
export type ReservationStatus = (typeof ReservationStatusEnum)[number];
export declare const Reservation: import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
    id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
    variant_id: import("@medusajs/framework/utils").TextProperty;
    cart_id: import("@medusajs/framework/utils").TextProperty;
    customer_id: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
    session_fingerprint: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
    status: import("@medusajs/framework/utils").EnumProperty<["active", "payment_pending", "released", "expired", "converted", "cancelled"]>;
    reserved_at: import("@medusajs/framework/utils").DateTimeProperty;
    expires_at: import("@medusajs/framework/utils").DateTimeProperty;
    payment_pending_until: import("@medusajs/framework/utils").NullableModifier<Date, import("@medusajs/framework/utils").DateTimeProperty>;
    converted_at: import("@medusajs/framework/utils").NullableModifier<Date, import("@medusajs/framework/utils").DateTimeProperty>;
    released_at: import("@medusajs/framework/utils").NullableModifier<Date, import("@medusajs/framework/utils").DateTimeProperty>;
    release_reason: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
}>, "wide_label_reservation">;
