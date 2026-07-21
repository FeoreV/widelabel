import type { Measurements, Defect, ConditionLabel } from "@wide-label/types";

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
}

export function ProductDetails({
  measurements,
  conditionRating,
  conditionLabel,
  conditionNotes,
  defects = [],
  archivalNotes,
}: ProductDetailsProps) {
  const fields = measurements?.fields;
  const unit = measurements?.unit || "cm";

  return (
    <div style={{ display: "grid", gap: "1.5rem", marginTop: "1.5rem" }}>
      {/* Measurements Section */}
      {fields && (
        <section style={{ borderTop: "1px solid #eee", paddingTop: "1rem" }}>
          <h3>Measurements ({unit})</h3>
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "0.5rem 1rem",
            }}
          >
            {fields.chest && (
              <>
                <dt style={{ fontWeight: "bold" }}>Chest:</dt>
                <dd>
                  {fields.chest} {unit}
                </dd>
              </>
            )}
            {fields.length && (
              <>
                <dt style={{ fontWeight: "bold" }}>Length:</dt>
                <dd>
                  {fields.length} {unit}
                </dd>
              </>
            )}
            {fields.sleeve && (
              <>
                <dt style={{ fontWeight: "bold" }}>Sleeve:</dt>
                <dd>
                  {fields.sleeve} {unit}
                </dd>
              </>
            )}
            {fields.shoulders && (
              <>
                <dt style={{ fontWeight: "bold" }}>Shoulders:</dt>
                <dd>
                  {fields.shoulders} {unit}
                </dd>
              </>
            )}
          </dl>
        </section>
      )}

      {/* Condition & Defects Section */}
      <section style={{ borderTop: "1px solid #eee", paddingTop: "1rem" }}>
        <h3>Condition & Integrity</h3>
        {conditionLabel && <p><strong>Condition:</strong> {conditionLabel}</p>}
        {conditionRating && <p><strong>Rating:</strong> {conditionRating}/5</p>}
        {conditionNotes && <p><strong>Notes:</strong> {conditionNotes}</p>}

        {defects && defects.length > 0 ? (
          <div>
            <h4>Documented Defects</h4>
            <ul>
              {defects.map((defect, idx) => (
                <li key={idx}>
                  <strong>{defect.kind}</strong> ({defect.severity || "recorded"}):{" "}
                  {defect.description}{" "}
                  {defect.location ? `at ${defect.location}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No defects recorded.</p>
        )}
      </section>

      {/* Archival Notes Section */}
      {archivalNotes && (
        <section style={{ borderTop: "1px solid #eee", paddingTop: "1rem" }}>
          <h3>Archival History</h3>
          {archivalNotes.archive_code && (
            <p><strong>Archive Ref:</strong> {archivalNotes.archive_code}</p>
          )}
          {archivalNotes.era && (
            <p><strong>Era:</strong> {archivalNotes.era}</p>
          )}
          {archivalNotes.provenance && (
            <p><strong>Provenance:</strong> {archivalNotes.provenance}</p>
          )}
          {archivalNotes.story && <p>{archivalNotes.story}</p>}
        </section>
      )}
    </div>
  );
}
