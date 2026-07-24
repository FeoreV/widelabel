import { getMedusaServerClient } from "../medusa/server";

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

  try {
    const client = getMedusaServerClient();
    const cart = await client.getCart(cartId);

    if (!cart) return null;

    const items: CartItemRead[] = (cart.items || []).map((item: any) => ({
      id: item.id,
      variant_id: item.variant_id || item.variant?.id || "",
      title: item.title || item.variant?.title || "1-of-1 Item",
      price: typeof item.unit_price === "number" ? item.unit_price : item.price || 0,
      currency_code: (cart.currency_code || "RUB").toUpperCase(),
      thumbnail: item.thumbnail || item.variant?.product?.thumbnail || null,
      reserved_until: item.metadata?.reserved_until
        ? String(item.metadata.reserved_until)
        : null,
    }));

    const calculatedSubtotal = items.reduce((sum, item) => sum + item.price, 0);
    const subtotal = typeof cart.subtotal === "number" ? cart.subtotal : calculatedSubtotal;
    const total = typeof cart.total === "number" ? cart.total : subtotal;

    return {
      id: cart.id,
      items,
      subtotal,
      total,
      currency_code: (cart.currency_code || "RUB").toUpperCase(),
    };
  } catch (err) {
    return null;
  }
}
