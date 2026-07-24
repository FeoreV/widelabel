import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  PostgresAdminDropService,
  type IAdminDropService,
} from "../../../../../admin/drop-admin.ts";

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const service: IAdminDropService =
    (req as any).scope?.resolve("adminDropService") || new PostgresAdminDropService();

  const drops = await service.listDrops();
  res.status(200).json({ drops });
};

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const service: IAdminDropService =
    (req as any).scope?.resolve("adminDropService") || new PostgresAdminDropService();

  const { title, slug, starts_at, ends_at, status } = req.body as any;

  if (!title || !slug || !starts_at) {
    res.status(400).json({
      code: "INVALID_INPUT",
      message: "title, slug, and starts_at are required",
      retryable: false,
    });
    return;
  }

  try {
    const drop = await service.createDrop({
      title,
      slug,
      starts_at: new Date(starts_at),
      ends_at: ends_at ? new Date(ends_at) : null,
      status,
    });

    res.status(201).json({ drop });
  } catch (err: any) {
    res.status(400).json({
      code: "DROP_CREATION_FAILED",
      message: err.message || "Failed to create drop",
      retryable: false,
    });
  }
};
