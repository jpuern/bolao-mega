// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { CONFIG } from "@/constants";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: CONFIG.NOME_APP,
  description: CONFIG.DESCRICAO_APP,
  keywords: ["bolão", "mega sena", "loteria", "apostas"],
  authors: [{ name: "Bolão Mega de Ouro" }],
  openGraph: {
    title: CONFIG.NOME_APP,
    description: CONFIG.DESCRICAO_APP,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
