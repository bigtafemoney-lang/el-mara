import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EL MARA",
  description:
    "EL MARA — Modern menswear designed with character, precision and distinction.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}