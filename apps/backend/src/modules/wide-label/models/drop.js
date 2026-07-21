import { model } from "@medusajs/framework/utils";
export const DropStatusEnum = ["draft", "scheduled", "live", "closed"];
export const Drop = model.define("wide_label_drop", {
    id: model.id().primaryKey(),
    slug: model.text().unique(),
    title: model.text(),
    description: model.text().default(""),
    status: model.enum(["draft", "scheduled", "live", "closed"]).default("draft"),
    starts_at: model.dateTime().nullable(),
    ends_at: model.dateTime().nullable(),
    hero_image_key: model.text().nullable(),
    seo_title: model.text().nullable(),
    seo_description: model.text().nullable(),
});
export const DropProduct = model.define("wide_label_drop_product", {
    drop_id: model.text(),
    product_id: model.text(),
    sort_order: model.number().default(0),
});
