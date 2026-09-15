"use client";

import { useEffect, useState } from "react";

interface TreasuryData {
  balance: number;
  platform: number;
  authors: number;
  readers: number;
}

interface SaleDay {
  date: string;
  count: number;
}

export default function TreasuryPage() {
  const [treasury, setTreasury] = useState<TreasuryData>({ balance: 0, platform: 0, authors: 0, readers: 0 });
  const [sales, setSales] = useState<SaleDay[]>([]);
  const [totalReads, setTotalReads] = useState(0);
  const [nextDist, setNextDist] = useState("—");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Treasury bakiyesi
    fetch("/api/treasury-balance")
      .then((r) => r.json())
      .then((data) => setTreasury(data));

    // Okuma istatistikleri
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setSales(data.sales || []);
        setTotalReads(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Sonraki dağıtım
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const diff = Math.ceil((lastDay.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    setNextDist(`${diff} days`);
  }, []);

  const rows = [
    { label: "Platform", pct: 15, color: "var(--ink)", desc: "Infrastructure & development", amount: treasury.platform },
    { label: "Authors", pct: 70, color: "var(--badge)", desc: "Weighted by USDC earned", amount: treasury.authors },
    { label: "Readers", pct: 15, color: "var(--accent)", desc: "Top spenders this cycle", amount: treasury.readers },
  ];

  return (
    <div className="main" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div style={{ background: "var(--accent)", padding: ".4rem .75rem", marginBottom: "1.5rem", display: "inline-block" }}>
        <span style={{ fontFamily: "var(--font-sub)", fontSize: ".82rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--accent-text)" }}>Treasury</span>
      </div>

      {/* Ana bakiye */}
      <div style={{ border: "2px solid var(--ink)", padding: "1.5rem 2rem", marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "var(--font-sub)", fontSize: ".72rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: ".4rem" }}>Total Treasury Balance</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "2.8rem", color: "var(--ink)", lineHeight: 1 }}>
            {treasury.balance.toFixed(2)} <span style={{ fontSize: "1.2rem", color: "var(--muted)" }}>USDC</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-sub)", fontSize: ".72rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: ".4rem" }}>Next Distribution</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", color: "var(--ink)" }}>{nextDist}</div>
        </div>
      </div>

      {/* Dağıtım breakdown */}
      <div className="col-label" style={{ marginBottom: "1rem" }}>Distribution Breakdown</div>
      <div style={{ border: "1px solid var(--gray-2)", marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: ".1rem", height: "8px" }}>
          {rows.map((r) => (
            <div key={r.label} style={{ width: r.pct + "%", height: "100%", background: r.color }} />
          ))}
        </div>
        {rows.map((r, i) => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".9rem 1.2rem", borderBottom: i < rows.length - 1 ? "1px solid var(--gray)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: r.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "var(--font-sub)", fontSize: ".85rem", fontWeight: 600, color: "var(--ink)", textTransform: "uppercase" }}>{r.label} — {r.pct}%</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: ".72rem", color: "var(--muted)" }}>{r.desc}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "var(--ink)" }}>
                {r.amount.toFixed(2)} <span style={{ fontSize: ".75rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>USDC</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* İstatistikler */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ border: "1px solid var(--gray-2)", padding: "1rem 1.2rem" }}>
          <div style={{ fontFamily: "var(--font-sub)", fontSize: ".68rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".3rem" }}>Total Reads This Cycle</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", color: "var(--ink)" }}>{loading ? "—" : totalReads}</div>
        </div>
        <div style={{ border: "1px solid var(--gray-2)", padding: "1rem 1.2rem" }}>
          <div style={{ fontFamily: "var(--font-sub)", fontSize: ".68rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".3rem" }}>Active Days</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", color: "var(--ink)" }}>{sales.length}</div>
        </div>
      </div>

      {/* Günlük geçmiş */}
      {sales.length > 0 && (
        <>
          <div className="col-label" style={{ marginBottom: "1rem" }}>Daily Read History</div>
          <div style={{ border: "1px solid var(--gray-2)" }}>
            {sales.map((s, i) => (
              <div key={s.date} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".65rem 1.2rem", borderBottom: i < sales.length - 1 ? "1px solid var(--gray)" : "none" }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: ".82rem", color: "var(--muted)" }}>{s.date}</span>
                <span style={{ fontFamily: "var(--font-sub)", fontSize: ".82rem", fontWeight: 600, color: "var(--ink)" }}>{s.count} reads</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ fontFamily: "var(--font-body)", fontSize: ".82rem", color: "var(--muted)", lineHeight: 1.7, borderLeft: "3px solid var(--accent)", paddingLeft: "1rem", marginTop: "2rem" }}>
        <strong style={{ color: "var(--ink)", fontFamily: "var(--font-sub)", textTransform: "uppercase", letterSpacing: ".05em" }}>How it works</strong><br />
        Every USDC payment flows into the treasury wallet on Base Sepolia.
        At the end of each month, the balance is distributed: 70% to authors weighted by USDC earned,
        15% to top readers weighted by USDC spent, and 15% to the platform.
      </div>
    </div>
  );
}
