import type { Metadata } from "next";
import { cookies } from "next/headers";
import { parseCartCookie } from "../../lib/cart/cart-cookie";
import { getCartReadModel } from "../../lib/cart/queries";
import { SiteHeader } from "../../components/home/site-header";
import { SiteFooter } from "../../components/home/site-footer";
import { CheckoutFlow } from "../../components/checkout/checkout-flow";
import { Typography } from "../../components/ui/typography";
import { Container } from "../../components/ui/container";
import { Section } from "../../components/ui/section";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Корзина и Оформление Заказа | WIDE LABEL",
  description: "Оформление заказа 1-of-1 селективного секонд-хенда. Доставка СДЭК и безопасная оплата ЮKassa.",
};

export default async function CartPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const cartId = parseCartCookie(cookieHeader) || "wl_cart_id";
  const cart = await getCartReadModel(cartId);

  return (
    <div className="storefront-root">
      <SiteHeader />

      <main id="main-content">
        <Section spacing="sm" style={{ backgroundColor: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)" }}>
          <Container>
            <Typography variant="caption" style={{ color: "var(--accent-lime)", marginBottom: "4px", display: "block" }}>
              15-МИНУТНАЯ СЕРВЕРНАЯ БРОНЬ
            </Typography>
            <Typography variant="headline-lg" as="h1">
              КОРЗИНА И ОФОРМЛЕНИЕ ЗАКАЗА
            </Typography>
          </Container>
        </Section>

        <Section spacing="md">
          <Container>
            <CheckoutFlow
              cart={cart || { id: cartId, subtotal: 0, total: 0, currency_code: "RUB", items: [] }}
              cartId={cartId}
            />
          </Container>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
