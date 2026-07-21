import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type { AvailabilityResponse } from "@wide-label/types";
import { InMemoryReservationRepository } from "../../../../../../modules/wide-label/repositories/reservation-repository.js";

export const defaultRepository = new InMemoryReservationRepository();

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const { id } = req.params;
  const repo: InMemoryReservationRepository =
    (req as any).scope?.resolve("reservationRepository") || defaultRepository;

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
