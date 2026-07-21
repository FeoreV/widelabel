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
    items: [
      {
        id: "item_01",
        variant_id: "var_vintage_tee_01_l",
        title: "Wide Label Vintage Tee (Size L)",
        price: 12000,
        currency_code: "USD",
        thumbnail: null,
        reserved_until: new Date(Date.now() + 14 * 60 * 1000).toISOString(),
      },
    ],
    subtotal: 12000,
    total: 12000,
    currency_code: "USD",
  };
}
