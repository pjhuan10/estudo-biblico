import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Estudo Bíblico",
  description: "Sistema de Estudos, Presença e Votação",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-black text-white">
        <Navbar />
        <div className="animate-enter">{children}</div>
      </body>
    </html>
  );
}
