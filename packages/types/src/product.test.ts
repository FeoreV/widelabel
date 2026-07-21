import assert from "node:assert";
import test from "node:test";
import { ProductMetadataSchema, ProductMediaContractSchema } from "./index.js";

test("ProductMetadataSchema validates valid product metadata", () => {
  const metadata = ProductMetadataSchema.parse({
    item_id: "ITEM-001",
    brand: "Vintage Brand",
    era: "1950s",
    condition_rating: 4,
    condition_label: "excellent",
  });
  assert.strictEqual(metadata.item_id, "ITEM-001");
  assert.strictEqual(metadata.era, "1950s");
});

test("ProductMediaContractSchema validates media list", () => {
  const mediaList = ProductMediaContractSchema.parse([
    {
      kind: "cover",
      sort_order: 0,
      alt: "Front view",
      sha256: "abc123sha",
      width: 1080,
      height: 1080,
      url: "https://example.com/cover.jpg",
      key: "products/cover.jpg",
    },
  ]);
  assert.strictEqual(mediaList.length, 1);
  assert.strictEqual(mediaList[0].kind, "cover");
});
