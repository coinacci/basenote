"use client";

import { useTreasury } from "@/hooks/useTreasury";

export function TreasuryStrip() {
  const { balanceHuman, countdownStr } = useTreasury();

  return (
    <div className="treasury-strip">
      <div className="treasury-inner">
        <div>
          <div className="t-label">Kasada Toplam</div>
          <div className="t-value">{balanceHuman} USDC</div>
        </div>
        <div className="t-divider" />
        <div>
          <div className="t-label">Sonraki Dagitim</div>
          <div className="t-value">{countdownStr}</div>
        </div>
        <div className="t-divider" />
        <div>
          <div className="t-label">Dagitim Orani</div>
          <div className="t-dist">
            <div className="t-seg-p" style={{ width: "15%" }} />
            <div className="t-seg-w" style={{ width: "70%" }} />
            <div className="t-seg-r" style={{ width: "15%" }} />
          </div>
          <div className="t-dist-label">Platform %15 · Yazarlar %70 · Okuyucular %15</div>
        </div>
        <a className="t-cta" href="/treasury">Kasayi Incele</a>
      </div>
    </div>
  );
}
