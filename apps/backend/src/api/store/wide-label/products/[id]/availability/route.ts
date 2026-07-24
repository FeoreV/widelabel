import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type { AvailabilityResponse } from "@wide-label/types";
import {
  PostgresReservationRepository,
  type IReservationRepository,
} from "../../../../../../modules/wide-label/repositories/reservation-repository.ts";

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const { id } = req.params;
  const repo: IReservationRepository =
    (req as any).scope?.resolve("reservationRepository") || new PostgresReservationRepository();

  const openReservation = await repo.findOpenByVariant(id);

  const responseData: AvailabilityResponse = {
    variant_id: id,
    status: openReservation ? "reserved" : "available",
    reserved_until: openReservation
      ? openReservation.expires_at.toISOString()
      : null,
  };

  res.status(200).json(responseData);
};
