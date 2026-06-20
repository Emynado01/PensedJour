import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ndule | Citation du jour",
  description: "Une citation inspirante et philosophique renouvelee chaque jour."
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

