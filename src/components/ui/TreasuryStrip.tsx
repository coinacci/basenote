"use client";

import { useTreasury } from "@/hooks/useTreasury";

export function TreasuryStrip() {
  const { balanceHuman, countdownStr } = useTreasury();

  return (
    <div className="treasury-strip">
      <div className="treasury-inner">
        <div>
          <div className="t-label">Treasury Balance</div>
          <div className="t-value">{balanceHuman} USDC</div>
        </div>
        <div className="t-divider" />
        <div>
          <div className="t-label">Next Distribution</div>
          <div className="t-value">{countdownStr}</div>
        </div>
        <div className="t-divider" />
        <div>
          <div className="t-label">Distribution</div>
          <div className="t-dist">
            <div className="t-seg-p" style={{ width: "15%" }} />
            <div className="t-seg-w" style={{ width: "70%" }} />
            <div className="t-seg-r" style={{ width: "15%" }} />
          </div>
          <div className="t-dist-label">Platform 15% · Authors 70% · Readers 15%</div>
        </div>
        <a className="t-cta" href="/treasury">View Treasury</a>
      </div>
    </div>
  );
}
