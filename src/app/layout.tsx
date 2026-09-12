import type { Metadata } from "next";
import { Providers } from "@/components/layout/Providers";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "basenote — Base üzerinde içerik platformu",
  description: "Yazarlar yazar, okuyucular x402 ile USDC öder, topluluk kasa paylaşır.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <nav>
            <div className="nav-inner">
              <a className="logo" href="/">
                base<span>note</span>
              </a>
              <div className="nav-links">
                <a href="/">Keşfet</a>
                <a href="/?cat=defi">DeFi</a>
                <a href="/?cat=ai">AI</a>
                <a href="/?cat=rehber">Rehberler</a>
                <a href="/treasury">Kasa</a>
              </div>
              <div className="nav-right">
                <ConnectButton />
                <a className="btn-write" href="/dashboard">Yazı yaz</a>
              </div>
            </div>
          </nav>
          {children}
          <footer>
            <div className="footer-logo">
              base<span style={{ color: "#0052FF" }}>note</span>
            </div>
            <div className="footer-links">
              <a href="#">Hakkında</a>
              <a href="/dashboard">Yazar rehberi</a>
              <a href="/treasury">Kasa</a>
              <a href="#">Yardım</a>
            </div>
            <div style={{ fontFamily: "system-ui", fontSize: ".7rem", color: "#bbb" }}>
              Base blockchain · x402 · USDC · EVM
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
