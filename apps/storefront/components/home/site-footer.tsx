import React from "react";
import Link from "next/link";
import { Container } from "../ui/container";
import { Typography } from "../ui/typography";
import { Divider } from "../ui/divider";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  const footerStyle: React.CSSProperties = {
    backgroundColor: "var(--bg-surface)",
    borderTop: "1px solid var(--border-subtle)",
    paddingTop: "56px",
    paddingBottom: "40px",
    marginTop: "64px",
  };

  const statusDotStyle: React.CSSProperties = {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "var(--accent-lime)",
  };

  const listStyle: React.CSSProperties = {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  };

  const flexColStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  };

  const bottomBarStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
    paddingTop: "24px",
  };

  return (
    <footer id="contacts" className="site-footer" style={footerStyle}>
      <Container>
        <div className="footer-grid">
          {/* Column 1: Brand & Concept Statement */}
          <div className="footer-col footer-col-brand">
            <Typography variant="headline-md" style={{ marginBottom: "12px", letterSpacing: "0.06em" }}>
              WIDE LABEL
            </Typography>
            <Typography variant="body-sm" style={{ maxWidth: "340px", marginBottom: "20px", color: "var(--text-secondary)" }}>
              Премиальный 1-of-1 concept store селективного секонд-хенда и архива. Каждый предмет существует в единственном экземпляре в мире.
            </Typography>
            <div className="footer-status-pill" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <span style={statusDotStyle} />
              <Typography variant="caption" style={{ color: "var(--accent-lime)" }}>
                ARCHIVE ONLINE &bull; 1-OF-1 INVENTORY ACTIVE
              </Typography>
            </div>
          </div>

          {/* Column 2: Navigation / Catalog */}
          <div className="footer-col">
            <Typography variant="label" style={{ marginBottom: "16px", display: "block" }}>
              НАВИГАЦИЯ
            </Typography>
            <ul style={listStyle}>
              <li>
                <Link href="/#catalog" className="footer-link">
                  Каталог дропа
                </Link>
              </li>
              <li>
                <Link href="/#collections" className="footer-link">
                  Тематические коллекции
                </Link>
              </li>
              <li>
                <Link href="/#concept" className="footer-link">
                  Манифест 1-of-1
                </Link>
              </li>
              <li>
                <Link href="/#story" className="footer-link">
                  История и отбор
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Service & Delivery */}
          <div className="footer-col">
            <Typography variant="label" style={{ marginBottom: "16px", display: "block" }}>
              СЕРВИС И ДОСТАВКА
            </Typography>
            <ul style={listStyle}>
              <li>
                <Link href="/#shipping" className="footer-link">
                  Экспресс-доставка СДЭК
                </Link>
              </li>
              <li>
                <span className="footer-text-muted">Безопасная оплата ЮKassa</span>
              </li>
              <li>
                <span className="footer-text-muted">15 минут бронирования в корзине</span>
              </li>
              <li>
                <span className="footer-text-muted">Аутентификация и замеры</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Social */}
          <div className="footer-col">
            <Typography variant="label" style={{ marginBottom: "16px", display: "block" }}>
              КОНТАКТЫ
            </Typography>
            <div style={flexColStyle}>
              <Typography variant="body-sm" style={{ color: "var(--text-secondary)" }}>
                По вопросам заказов и подлинности:
              </Typography>
              <a href="mailto:support@widelabel.store" className="footer-link" style={{ textTransform: "lowercase" }}>
                support@widelabel.store
              </a>
              <Typography variant="caption" style={{ marginTop: "8px", color: "var(--text-tertiary)" }}>
                МОСКВА / SANKT-PETERSBURG ARCHIVE
              </Typography>
            </div>
          </div>
        </div>

        <Divider spacing="lg" />

        {/* Bottom Bar: Copyright & Compliance */}
        <div style={bottomBarStyle}>
          <Typography variant="caption" style={{ color: "var(--text-tertiary)" }}>
            &copy; {currentYear} WIDE LABEL. ALL 1-OF-1 PIECES ARE UNIQUE ARCHIVE ITEMS.
          </Typography>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Typography variant="caption" style={{ color: "var(--text-tertiary)" }}>
              CDEK &bull; YOOKASSA &bull; MEDUSA V2
            </Typography>
          </div>
        </div>
      </Container>
    </footer>
  );
}
