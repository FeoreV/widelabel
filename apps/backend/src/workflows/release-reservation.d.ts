import type { IReservationRepository, ReservationRecord } from "../modules/wide-label/repositories/reservation-repository.js";
export interface ReleaseReservationInput {
    cart_id: string;
    variant_id: string;
    reason?: string;
}
export declare function releaseReservationWorkflow(repository: IReservationRepository, input: ReleaseReservationInput, now?: Date): Promise<ReservationRecord | null>;
