import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  PostgresAdminProductExtensionService,
  type IAdminProductExtensionService,
} from "../../../../../admin/product-extension.ts";

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const { id } = req.params;
  const service: IAdminProductExtensionService =
    (req as any).scope?.resolve("adminProductExtensionService") || new PostgresAdminProductExtensionService();

  const details = await service.getProductDetails(id);
  if (!details) {
    res.status(404).json({ code: "NOT_FOUND", message: "Product details not found", retryable: false });
    return;
  }

  res.status(200).json({ product_details: details });
};

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const { id } = req.params;
  const service: IAdminProductExtensionService =
    (req as any).scope?.resolve("adminProductExtensionService") || new PostgresAdminProductExtensionService();

  const { condition_label, measurements, defects, archival_notes } = req.body as any;

  const updated = await service.updateProductDetails({
    product_id: id,
    condition_label,
    measurements,
    defects,
    archival_notes,
  });

  res.status(200).json({ product_details: updated });
};
