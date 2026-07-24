import React from "react";
import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Badge } from "@medusajs/ui";

const ProductConditionWidget = () => {
  return (
    <Container className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Heading level="h2">1-of-1 Piece Details & Condition</Heading>
        <Badge color="purple">1-of-1 Archival</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 border rounded bg-ui-bg-subtle">
          <p className="font-semibold text-ui-fg-muted">Condition Rating</p>
          <p className="text-base font-medium mt-1">Excellent (9/10)</p>
        </div>

        <div className="p-3 border rounded bg-ui-bg-subtle">
          <p className="font-semibold text-ui-fg-muted">Measurements System</p>
          <p className="text-base font-medium mt-1">Version 1 (cm)</p>
        </div>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.after",
});

export default ProductConditionWidget;
