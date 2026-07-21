import { InMemoryReservationRepository } from "../../../../../../modules/wide-label/repositories/reservation-repository.js";
export const defaultRepository = new InMemoryReservationRepository();
export const GET = async (req, res) => {
    const { id } = req.params;
    const repo = req.scope?.resolve("reservationRepository") || defaultRepository;
    const openReservation = await repo.findOpenByVariant(id);
    const responseData = {
        variant_id: id,
        status: openReservation ? "reserved" : "available",
        reserved_until: openReservation
            ? openReservation.expires_at.toISOString()
            : null,
    };
    res.status(200).json(responseData);
};
