import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clinica Sorriso Feliz Dashboard",
  description: "WhatsApp AI Agent operations dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
