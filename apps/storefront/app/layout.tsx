import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../styles/globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0b0c",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: {
    default: "WIDE LABEL — 1-of-1 Concept Store & Fashion Archive",
    template: "%s | WIDE LABEL",
  },
  description:
    "Премиальный концепт-стор селективного секонд-хенда и винтажного архива. Каждый предмет — уникальное изделие в единственном экземпляре.",
  keywords: [
    "WIDE LABEL",
    "1-of-1",
    "concept store",
    "fashion archive",
    "selective second hand",
    "vintage fashion",
    "селективный секонд-хенд",
    "винтаж",
    "концепт-стор",
  ],
  authors: [{ name: "WIDE LABEL Archive Team" }],
  openGraph: {
    title: "WIDE LABEL — 1-of-1 Concept Store & Fashion Archive",
    description:
      "Премиальный концепт-стор селективного секонд-хенда и винтажного архива. Каждая вещь в единственном экземпляре.",
    url: "https://widelabel.store",
    siteName: "WIDE LABEL",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WIDE LABEL — 1-of-1 Concept Store",
    description: "Премиальный селективный секонд-хенд и винтажный архив.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <div className="storefront-root">{children}</div>
      </body>
    </html>
  );
}
