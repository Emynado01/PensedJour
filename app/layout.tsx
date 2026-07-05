import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KIMIA | Pensee du jour",
  description: "Une pensee et une devinette quotidienne pour commencer la journee."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
