import type { Metadata } from "next";
import { Providers } from "@/components/layout/Providers";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "BASENOTE — Content platform on Base",
  description: "Writers publish, readers pay with USDC via x402, community shares the treasury.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <ThemeProvider>
            <nav>
              <div className="nav-inner">
                <a className="logo" href="/">BASE<span>NOTE</span></a>
                <div className="nav-links">
                  <a href="/">Explore</a>
                  <a href="/?cat=defi">DeFi</a>
                  <a href="/?cat=ai">AI</a>
                  <a href="/?cat=guides">Guides</a>
                  <a href="/treasury">Treasury</a>
                </div>
                <div className="nav-right">
                  <ConnectButton />
                  <a className="btn-write" href="/dashboard">Write</a>
                </div>
              </div>
            </nav>
            {children}
            <footer>
              <div className="footer-logo">BASE<span style={{ color: "var(--gold)" }}>NOTE</span></div>
              <div className="footer-links">
                <a href="/about">About</a>
                
                <a href="/treasury">Treasury</a>
                
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: ".7rem", color: "var(--muted)" }}>
                Base blockchain · x402 · USDC · EVM
              </div>
            </footer>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
