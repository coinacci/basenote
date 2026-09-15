"use client";

import { useEffect, useState } from "react";

interface TreasuryData {
  balance: number;
  nextDistributionAt: string;
}

function useCountdown(targetTs: number) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = targetTs * 1000 - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [targetTs]);

  return timeLeft;
}

export function TreasuryStrip() {
  const [data, setData] = useState<TreasuryData>({ balance: 0, nextDistributionAt: "0" });

  useEffect(() => {
    fetch("/api/treasury-balance")
      .then((r) => r.json())
      .then(setData);
  }, []);

  const countdown = useCountdown(parseInt(data.nextDistributionAt));
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="treasury-strip">
      <div className="treasury-inner">
        <div>
          <div className="t-label">Treasury Balance</div>
          <div className="t-value">{data.balance.toFixed(2)} USDC</div>
        </div>
        <div className="t-divider" />
        <div>
          <div className="t-label">Next Distribution</div>
          <div className="t-value">
            {pad(countdown.days)}d {pad(countdown.hours)}h {pad(countdown.minutes)}m {pad(countdown.seconds)}s
          </div>
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
