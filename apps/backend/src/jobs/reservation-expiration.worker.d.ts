import type { IReservationRepository } from "../modules/wide-label/repositories/reservation-repository.js";
export interface ReservationExpirationJobData {
    reservation_id: string;
    variant_id: string;
}
export interface ExpirationProcessResult {
    processed: boolean;
    reservation_id?: string;
    reason?: string;
}
export declare function processReservationExpirationJob(repository: IReservationRepository, jobData: ReservationExpirationJobData, now?: Date): Promise<ExpirationProcessResult>;
