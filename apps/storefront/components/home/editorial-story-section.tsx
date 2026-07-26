import React from "react";
import { Container } from "../ui/container";
import { Typography } from "../ui/typography";
import { Section } from "../ui/section";
import { Badge } from "../ui/badge";

export function EditorialStorySection() {
  const grades = [
    {
      grade: "MINT / NEW",
      desc: "Идеальное состояние без следов носки. Часто с оригинальными бирками или архивным хранением.",
      status: "available" as const,
    },
    {
      grade: "EXCELLENT VINTAGE",
      desc: "Минимальные естественные следы времени, придающие вещи благородный винтажный характер.",
      status: "neutral" as const,
    },
    {
      grade: "ARCHIVAL DEFECT",
      desc: "Характерные паттерны износа или микродефекты. Обязательно подлежат 100% фотофиксации и раскрытию в OrderSnapshot.",
      status: "reserved" as const,
    },
  ];

  return (
    <Section id="story" spacing="lg">
      <Container>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "48px", alignItems: "center" }}>
          <div>
            <Typography variant="caption" style={{ color: "var(--accent-lime)", marginBottom: "12px", display: "block" }}>
              EDITORIAL &amp; VERIFICATION
            </Typography>
            <Typography variant="headline-lg" style={{ marginBottom: "20px" }}>
              ПРОЗРАЧНОСТЬ КАЖДОЙ ДЕТАЛИ
            </Typography>
            <Typography variant="body-lg" style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
              Каждый замер в сантиметрах, оригинальный артикул, оттенок ткани и физические дефекты фиксируются до покупки. Мы гарантируем полное соответствие доставленного изделия с отснятым архивом.
            </Typography>
            <Typography variant="body-md" style={{ color: "var(--text-secondary)" }}>
              После оформления заказа сервер формирует неизменяемый <code>OrderSnapshot</code>, фиксирующий состояние товара на момент бронирования.
            </Typography>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {grades.map((g) => (
              <div
                key={g.grade}
                style={{
                  padding: "20px 24px",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <Typography variant="title-lg">{g.grade}</Typography>
                  <Badge status={g.status} variant="pill" dot={false}>
                    GRADE
                  </Badge>
                </div>
                <Typography variant="body-sm" style={{ color: "var(--text-secondary)" }}>
                  {g.desc}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
