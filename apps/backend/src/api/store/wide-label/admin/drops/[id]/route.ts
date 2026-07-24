import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  PostgresAdminDropService,
  type IAdminDropService,
} from "../../../../../../admin/drop-admin.ts";

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const { id } = req.params;
  const service: IAdminDropService =
    (req as any).scope?.resolve("adminDropService") || new PostgresAdminDropService();

  const drop = await service.getDrop(id);
  if (!drop) {
    res.status(404).json({ code: "NOT_FOUND", message: "Drop not found", retryable: false });
    return;
  }

  const products = await service.getDropProducts(id);
  res.status(200).json({ drop, products });
};

export const PUT = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const { id } = req.params;
  const service: IAdminDropService =
    (req as any).scope?.resolve("adminDropService") || new PostgresAdminDropService();

  const { title, starts_at, ends_at, status, product_ids } = req.body as any;

  const updated = await service.updateDrop(id, {
    title,
    starts_at: starts_at ? new Date(starts_at) : undefined,
    ends_at: ends_at ? new Date(ends_at) : undefined,
    status,
  });

  if (!updated) {
    res.status(404).json({ code: "NOT_FOUND", message: "Drop not found", retryable: false });
    return;
  }

  if (Array.isArray(product_ids)) {
    await service.assignProductsToDrop(id, product_ids);
  }

  const products = await service.getDropProducts(id);
  res.status(200).json({ drop: updated, products });
};

export const DELETE = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const { id } = req.params;
  const service: IAdminDropService =
    (req as any).scope?.resolve("adminDropService") || new PostgresAdminDropService();

  const success = await service.deleteDrop(id);
  if (!success) {
    res.status(404).json({ code: "NOT_FOUND", message: "Drop not found", retryable: false });
    return;
  }

  res.status(200).json({ success: true, id });
};
