export interface CartItemRead {
  id: string;
  variant_id: string;
  title: string;
  price: number;
  currency_code: string;
  thumbnail?: string | null;
  reserved_until: string | null;
}

export interface CartReadModel {
  id: string;
  items: CartItemRead[];
  subtotal: number;
  total: number;
  currency_code: string;
}

export async function getCartReadModel(
  cartId: string | null
): Promise<CartReadModel | null> {
  if (!cartId) return null;

  return {
    id: cartId,
    items: [],
    subtotal: 0,
    total: 0,
    currency_code: "RUB",
  };
}
