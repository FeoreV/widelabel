export const CART_COOKIE_NAME = "_wl_cart_id";

export interface CartCookieOptions {
  name?: string;
  maxAge?: number;
}

export function parseCartCookie(
  cookieHeader: string | null | undefined,
  cookieName = CART_COOKIE_NAME
): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`(?:^|; )\\s*${cookieName}\\s*=\\s*([^;]+)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function formatCartCookie(
  cartId: string,
  options: CartCookieOptions = {}
): string {
  const name = options.name || CART_COOKIE_NAME;
  const maxAge = options.maxAge || 60 * 60 * 24 * 30; // 30 days
  return `${name}=${encodeURIComponent(cartId)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax; Secure`;
}
