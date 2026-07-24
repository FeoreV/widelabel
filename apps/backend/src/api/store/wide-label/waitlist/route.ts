import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { JoinWaitlistPayloadSchema } from "@wide-label/types";
import { PostgresWaitlistRepository } from "../../../../modules/wide-label/models/waitlist.ts";

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const parseResult = JoinWaitlistPayloadSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      code: "INVALID_INPUT",
      message: "variant_id, consent_version, and either email or telegram_handle are required",
      errors: parseResult.error.flatten(),
      retryable: false,
    });
    return;
  }

  const { variant_id, email, telegram_handle, channel, consent_version } = parseResult.data;

  const repo =
    (req as any).scope?.resolve("waitlistRepository") || new PostgresWaitlistRepository();

  try {
    const entry = await repo.create({
      variant_id,
      email: email || undefined,
      telegram_handle: telegram_handle || undefined,
      channel: channel || (email ? "email" : "telegram"),
      consent_version,
    });

    res.status(200).json({
      id: entry.id,
      variant_id: entry.variant_id,
      status: entry.status,
      created_at: entry.created_at.toISOString(),
    });
  } catch (err: any) {
    res.status(400).json({
      code: "WAITLIST_ERROR",
      message: err.message || "Failed to join waitlist",
      retryable: false,
    });
  }
};
