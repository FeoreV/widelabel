import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { InMemoryReservationRepository } from "../../../../../modules/wide-label/repositories/reservation-repository.js";
export declare const defaultRepository: InMemoryReservationRepository;
export declare const POST: (req: MedusaRequest, res: MedusaResponse) => Promise<void>;
