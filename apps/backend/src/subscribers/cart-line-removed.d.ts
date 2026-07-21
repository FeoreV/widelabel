import type { IReservationRepository } from "../modules/wide-label/repositories/reservation-repository.js";
export interface CartLineRemovedEventData {
    cart_id: string;
    variant_id: string;
    line_item_id?: string;
}
export declare function handleCartLineRemoved(repository: IReservationRepository, event: CartLineRemovedEventData, now?: Date): Promise<boolean>;
