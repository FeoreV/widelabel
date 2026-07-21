export interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  alt?: string;
}

export function ProductGallery({ media = [] }: { media?: MediaItem[] }) {
  if (media.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "300px",
          backgroundColor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          color: "#666",
        }}
      >
        Archival Piece Image Placeholder
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      }}
    >
      {media.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {item.type === "image" ? (
            <img
              src={item.url}
              alt={item.alt || "Product image"}
              style={{ width: "100%", display: "block" }}
            />
          ) : (
            <video src={item.url} controls style={{ width: "100%" }} />
          )}
        </div>
      ))}
    </div>
  );
}
