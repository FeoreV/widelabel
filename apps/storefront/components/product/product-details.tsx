import type { Measurements, Defect, ConditionLabel } from "@wide-label/types";
import { Typography } from "../ui/typography";
import { Divider } from "../ui/divider";
import { Badge } from "../ui/badge";

export interface ArchivalNotes {
  era?: string;
  provenance?: string;
  archive_code?: string;
  story?: string;
}

export interface ProductDetailsProps {
  measurements?: Partial<Measurements> | null;
  conditionRating?: number | null;
  conditionLabel?: ConditionLabel | null;
  conditionNotes?: string | null;
  defects?: Defect[] | null;
  archivalNotes?: ArchivalNotes | null;
  material?: string | null;
}

export function ProductDetails({
  measurements,
  conditionRating,
  conditionLabel,
  conditionNotes,
  defects = [],
  archivalNotes,
  material,
}: ProductDetailsProps) {
  const fields = measurements?.fields;
  const unit = (measurements?.unit || "см").toLowerCase();

  return (
    <div className="product-details-container" style={{ display: "flex", flexDirection: "column", gap: "28px", marginTop: "32px" }}>
      {/* 1. Measurements Section */}
      {fields && (
        <section aria-labelledby="measurements-heading">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <Typography id="measurements-heading" variant="label">
              ЗАМЕРЫ ИЗДЕЛИЯ ({unit.toUpperCase()})
            </Typography>
            <Typography variant="caption" style={{ color: "var(--accent-lime)" }}>
              100% ВЕРИФИЦИРОВАННЫЙ ОБМЕР
            </Typography>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "12px",
              padding: "16px",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            {fields.chest && (
              <div>
                <Typography variant="caption" style={{ color: "var(--text-tertiary)", display: "block" }}>
                  ГРУДЬ (CHEST)
                </Typography>
                <Typography variant="title-lg">
                  {fields.chest} {unit}
                </Typography>
              </div>
            )}
            {fields.length && (
              <div>
                <Typography variant="caption" style={{ color: "var(--text-tertiary)", display: "block" }}>
                  ДЛИНА (LENGTH)
                </Typography>
                <Typography variant="title-lg">
                  {fields.length} {unit}
                </Typography>
              </div>
            )}
            {fields.sleeve && (
              <div>
                <Typography variant="caption" style={{ color: "var(--text-tertiary)", display: "block" }}>
                  РУКАВ (SLEEVE)
                </Typography>
                <Typography variant="title-lg">
                  {fields.sleeve} {unit}
                </Typography>
              </div>
            )}
            {fields.shoulders && (
              <div>
                <Typography variant="caption" style={{ color: "var(--text-tertiary)", display: "block" }}>
                  ПЛЕЧИ (SHOULDERS)
                </Typography>
                <Typography variant="title-lg">
                  {fields.shoulders} {unit}
                </Typography>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. Material */}
      {material && (
        <section aria-labelledby="material-heading">
          <Typography id="material-heading" variant="label" style={{ marginBottom: "8px", display: "block" }}>
            СОСТАВ И МАТЕРИАЛ
          </Typography>
          <Typography variant="body-md" style={{ color: "var(--text-secondary)" }}>
            {material}
          </Typography>
        </section>
      )}

      <Divider />

      {/* 3. Condition & Defects Section */}
      <section aria-labelledby="condition-heading">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <Typography id="condition-heading" variant="label">
            СОСТОЯНИЕ И ЦЕЛОСТНОСТЬ
          </Typography>
          {conditionRating && (
            <Badge status="available" variant="pill">
              ОЦЕНКА: {conditionRating}/5
            </Badge>
          )}
        </div>

        <div style={{ padding: "16px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}>
          {conditionLabel && (
            <div style={{ marginBottom: "8px" }}>
              <Typography variant="caption" style={{ color: "var(--text-tertiary)", display: "block" }}>
                ГРАДАЦИЯ:
              </Typography>
              <Typography variant="title-lg" style={{ color: "var(--text-primary)" }}>
                {conditionLabel}
              </Typography>
            </div>
          )}
          {conditionNotes && (
            <Typography variant="body-sm" style={{ color: "var(--text-secondary)", marginTop: "6px", display: "block" }}>
              {conditionNotes}
            </Typography>
          )}

          {/* Defects list (Transparently disclosed) */}
          {defects && defects.length > 0 ? (
            <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px dashed var(--border-subtle)" }}>
              <Typography variant="caption" style={{ color: "var(--state-reserved)", marginBottom: "8px", display: "block" }}>
                ПРОТОКОЛИРОВАННЫЕ НЮАНСЫ И СЛЕДЫ ВРЕМЕНИ:
              </Typography>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                {defects.map((defect, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px" }}>
                    <span style={{ color: "var(--state-reserved)", fontWeight: 700 }}>&bull;</span>
                    <div>
                      <strong style={{ color: "var(--text-primary)", textTransform: "uppercase" }}>{defect.kind}</strong>
                      {defect.severity ? ` [${defect.severity}]` : ""}: {defect.description}
                      {defect.location ? ` (локация: ${defect.location})` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <Typography variant="caption" style={{ color: "var(--accent-lime)", marginTop: "12px", display: "block" }}>
              &check; НИКАКИХ СКРЫТЫХ ДЕФЕКТОВ НЕ ОБНАРУЖЕНО
            </Typography>
          )}
        </div>
      </section>

      {/* 4. Archival History Section */}
      {archivalNotes && (
        <section aria-labelledby="archival-heading">
          <Typography id="archival-heading" variant="label" style={{ marginBottom: "12px", display: "block" }}>
            АРХИВНАЯ СПРАВКА И ПРОВИЗОР
          </Typography>
          <div style={{ padding: "16px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}>
            {archivalNotes.archive_code && (
              <Typography variant="caption" style={{ color: "var(--text-tertiary)", display: "block", marginBottom: "4px" }}>
                ARCHIVE REF: {archivalNotes.archive_code}
              </Typography>
            )}
            {archivalNotes.era && (
              <Typography variant="body-sm" style={{ color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                <strong>ЭПОХА / РЕЛИЗ:</strong> {archivalNotes.era}
              </Typography>
            )}
            {archivalNotes.provenance && (
              <Typography variant="body-sm" style={{ color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                <strong>ПРОИСХОЖДЕНИЕ:</strong> {archivalNotes.provenance}
              </Typography>
            )}
            {archivalNotes.story && (
              <Typography variant="body-sm" style={{ color: "var(--text-primary)", marginTop: "8px", display: "block" }}>
                {archivalNotes.story}
              </Typography>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
