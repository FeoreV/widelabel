import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  PostgresOperationsReadModelsService,
  type IOperationsReadModelsService,
} from "../../../../../admin/operations-read-models.ts";

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const service: IOperationsReadModelsService =
    (req as any).scope?.resolve("operationsReadModelsService") || new PostgresOperationsReadModelsService();

  const now = new Date();
  const activeHolds = await service.getActiveHoldsMetrics(now);
  const paymentFailures = await service.getPaymentFailures();
  const webhookLag = await service.getWebhookLagMetrics();
  const shipmentFailures = await service.getShipmentFailures();

  res.status(200).json({
    metrics: {
      active_holds: activeHolds,
      payment_failures: paymentFailures,
      webhook_lag: webhookLag,
      shipment_failures: shipmentFailures,
      timestamp: now.toISOString(),
    },
  });
};
