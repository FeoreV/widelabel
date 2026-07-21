export async function createOrderSnapshotWorkflow(snapshotRepo, catalogProvider, input) {
    // Client price, inventory and metadata are NEVER trusted.
    // Data is fetched exclusively from server-side product catalog provider.
    const canonicalProduct = await catalogProvider.getCanonicalVariantData(input.variant_id);
    const snapshot = {
        id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        order_id: input.order_id,
        variant_id: input.variant_id,
        title: canonicalProduct.title,
        price: canonicalProduct.price,
        currency_code: canonicalProduct.currency_code,
        measurements: canonicalProduct.measurements,
        defects: canonicalProduct.defects,
        media_checksums: canonicalProduct.media_checksums,
        consent_version: input.consent_version,
        created_at: new Date(),
    };
    return snapshotRepo.create(snapshot);
}
