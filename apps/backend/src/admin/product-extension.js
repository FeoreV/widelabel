export class AdminProductExtensionService {
    products = new Map();
    updateProductDetails(input) {
        const existing = this.products.get(input.product_id) || {
            product_id: input.product_id,
            condition_label: "excellent",
            measurements: { version: 1, unit: "cm", fields: {} },
            defects: [],
            updated_at: new Date(),
        };
        const updated = {
            ...existing,
            condition_label: input.condition_label || existing.condition_label,
            measurements: input.measurements || existing.measurements,
            defects: input.defects || existing.defects,
            archival_notes: input.archival_notes !== undefined
                ? input.archival_notes
                : existing.archival_notes,
            updated_at: new Date(),
        };
        this.products.set(input.product_id, updated);
        // CRITICAL INVARIANT GUARANTEE: This admin update ONLY mutates live product metadata.
        // OrderSnapshot tables are strictly untouched.
        return updated;
    }
    getProductDetails(productId) {
        return this.products.get(productId) || null;
    }
}
