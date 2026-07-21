import type { IReservationRepository } from "../modules/wide-label/repositories/reservation-repository.js";
export interface SweeperRunResult {
    sweptCount: number;
    expiredReservationIds: string[];
}
export declare function runReservationSweeperBatch(repository: IReservationRepository, now?: Date): Promise<SweeperRunResult>;
