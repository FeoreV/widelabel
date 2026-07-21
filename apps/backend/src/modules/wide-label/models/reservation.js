import { model } from "@medusajs/framework/utils";
export const ReservationStatusEnum = [
    "active",
    "payment_pending",
    "released",
    "expired",
    "converted",
    "cancelled",
];
export const Reservation = model.define("wide_label_reservation", {
    id: model.id().primaryKey(),
    variant_id: model.text(),
    cart_id: model.text(),
    customer_id: model.text().nullable(),
    session_fingerprint: model.text().nullable(),
    status: model
        .enum([
        "active",
        "payment_pending",
        "released",
        "expired",
        "converted",
        "cancelled",
    ])
        .default("active"),
    reserved_at: model.dateTime(),
    expires_at: model.dateTime(),
    payment_pending_until: model.dateTime().nullable(),
    converted_at: model.dateTime().nullable(),
    released_at: model.dateTime().nullable(),
    release_reason: model.text().nullable(),
});
