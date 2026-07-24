export default function Loading() {
  return (
    <div className="storefront-root" style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      <div
        className="container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "2px solid var(--border-strong)",
            borderTopColor: "var(--accent-lime)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
          aria-hidden="true"
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <p
          style={{
            fontSize: "12px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
          }}
        >
          Загрузка WIDE LABEL...
        </p>
      </div>
    </div>
  );
}
