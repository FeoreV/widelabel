import assert from "node:assert";
import test from "node:test";
import { ProductGallery } from "./product-gallery";
import { ProductDetails } from "./product-details";

test("ProductGallery handles empty media list without crashing", () => {
  const result = ProductGallery({ media: [] });
  assert.ok(result);
});

test("ProductDetails renders measurements and condition notes without crashing", () => {
  const result = ProductDetails({
    measurements: {
      version: 1,
      unit: "cm",
      fields: { chest: 60, length: 72 },
    },
    conditionLabel: "excellent",
    conditionRating: 5,
    conditionNotes: "Light wear",
    defects: [],
    archivalNotes: { era: "1990s" },
  });

  assert.ok(result);
});
