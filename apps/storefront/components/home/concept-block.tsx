import React from "react";
import { Container } from "../ui/container";
import { Typography } from "../ui/typography";
import { Section } from "../ui/section";

export function ConceptBlock() {
  const pillars = [
    {
      num: "01",
      title: "1-OF-1 INVENTORY",
      desc: "Каждая позиция существует в единственном экземпляре в определённом размере и состоянии. Когда вы активируете бронь в корзине, сервер блокирует изделие на 15 минут только для вашего заказа.",
    },
    {
      num: "02",
      title: "AUTHENTICITY & CONDITION",
      desc: "Вещи проходят физическую верификацию подлинности, детальный обмер (грудь, плечи, длина, рукав) и протоколирование следов износа или архивационных нюансов.",
    },
    {
      num: "03",
      title: "SUSTAINABLE ARCHIVE",
      desc: "Селективный секонд-хенд и винтаж премиальных брендов как культура осознанного потребления и поиск редких силуэтов, снятых с производства.",
    },
  ];

  return (
    <Section id="concept" spacing="lg" style={{ backgroundColor: "var(--bg-surface)" }}>
      <Container>
        <div style={{ maxWidth: "780px", marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ width: "6px", height: "6px", backgroundColor: "var(--accent-lime)", borderRadius: "50%" }} />
            <Typography variant="caption" style={{ color: "var(--accent-lime)" }}>
              КОНЦЕПЦИЯ WIDE LABEL
            </Typography>
          </div>
          <Typography variant="headline-lg" style={{ marginBottom: "16px" }}>
            ФАШН-АРХИВ ВМЕСТО МАСС-МАРКЕТА
          </Typography>
          <Typography variant="body-lg" style={{ color: "var(--text-secondary)" }}>
            WIDE LABEL создавался для ценителей уникального кроя и исторических релизов. Мы отвергаем алгоритмический масс-маркет в пользу кураторского селекта.
          </Typography>
        </div>

        <div className="concept-grid">
          {pillars.map((p) => (
            <div key={p.num} className="concept-card">
              <Typography variant="headline-md" style={{ color: "var(--accent-lime)", marginBottom: "12px" }}>
                {p.num}
              </Typography>
              <Typography variant="title-lg" style={{ marginBottom: "8px" }}>
                {p.title}
              </Typography>
              <Typography variant="body-md" style={{ color: "var(--text-secondary)" }}>
                {p.desc}
              </Typography>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
