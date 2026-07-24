"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
          gap: "24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--text-primary)",
          }}
        >
          Что-то пошло не так
        </h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: "480px" }}>
          Произошла непредвиденная ошибка при загрузке страницы.
        </p>
        <button type="button" className="btn-primary" onClick={() => reset()}>
          Повторить попытку
        </button>
      </div>
    </div>
  );
}
