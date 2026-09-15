"use client";

import { useEffect, useState } from "react";

interface SaleDay {
  date: string;
  count: number;
}

export default function TreasuryPage() {
  const [balance, setBalance] = useState<number>(0);
  const [sales, setSales] = useState<SaleDay[]>([]);
  const [totalReads, setTotalReads] = useState<number>(0);
  const [nextDist, setNextDist] = useState<string>("—");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Stats API'den veri çek
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setSales(data.sales || []);
        setTotalReads(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Sonraki dağıtım — ayın son günü
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const diff = Math.ceil((lastDay.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    setNextDist(`${diff} days`);
  }, []);

  // Toplam bakiye — reads × ortalama fiyat (stats'tan)
  // Gerçek değer: treasury cüzdanındaki USDC — şimdilik okuma sayısından tahmin
  const rows = [
    { label: "Platform", pct: 15, color: "var(--ink)", desc: "Infrastructure & development" },
    { label: "Authors", pct: 70, color: "var(--badge)", desc: "Weighted by USDC earned" },
    { label: "Readers", pct: 15, color: "var(--accent)", desc: "Top spenders this cycle" },
  ];

  return (
    <div className="main" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div style={{ background: "var(--accent)", padding: ".4rem .75rem", marginBottom: "1.5rem", display: "inline-block" }}>
        <span style={{ fontFamily: "var(--font-sub)", fontSize: ".82rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--accent-text)" }}>Treasury</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total Reads", value: loading ? "—" : totalReads.toString() },
          { label: "Next Distribution", value: nextDist },
          { label: "Days This Cycle", value: sales.length > 0 ? `${sales.length} days active` : "—" },
        ].map((s) => (
          <div key={s.label} style={{ border: "1px solid var(--gray-2)", padding: "1rem 1.2rem" }}>
            <div style={{ fontFamily: "var(--font-sub)", fontSize: ".68rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".3rem" }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", color: "var(--ink)" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Günlük satış geçmişi */}
      {sales.length > 0 && (
        <>
          <div className="col-label" style={{ marginBottom: "1rem" }}>Daily Read History</div>
          <div style={{ border: "1px solid var(--gray-2)", marginBottom: "2rem" }}>
            {sales.map((s, i) => (
              <div key={s.date} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".65rem 1.2rem", borderBottom: i < sales.length - 1 ? "1px solid var(--gray)" : "none" }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: ".82rem", color: "var(--muted)" }}>{s.date}</span>
                <span style={{ fontFamily: "var(--font-sub)", fontSize: ".82rem", fontWeight: 600, color: "var(--ink)" }}>{s.count} reads</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="col-label" style={{ marginBottom: "1rem" }}>Distribution Breakdown</div>
      <div style={{ border: "1px solid var(--gray-2)", padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: ".1rem", height: "10px", marginBottom: "1.2rem", overflow: "hidden" }}>
          {rows.map((r) => (
            <div key={r.label} style={{ width: r.pct + "%", height: "100%", background: r.color }} />
          ))}
        </div>
        {rows.map((r, i) => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".7rem 0", borderBottom: i < rows.length - 1 ? "1px solid var(--gray)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: r.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "var(--font-sub)", fontSize: ".85rem", fontWeight: 600, color: "var(--ink)", textTransform: "uppercase" }}>{r.label}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: ".72rem", color: "var(--muted)" }}>{r.desc}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "var(--ink)" }}>{r.pct}%</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: "var(--font-body)", fontSize: ".82rem", color: "var(--muted)", lineHeight: 1.7, borderLeft: "3px solid var(--accent)", paddingLeft: "1rem" }}>
        <strong style={{ color: "var(--ink)", fontFamily: "var(--font-sub)", textTransform: "uppercase", letterSpacing: ".05em" }}>How it works</strong><br />
        Every USDC payment flows into the treasury wallet. At the end of each month,
        the balance is split: 70% to authors (weighted by USDC earned), 15% to top readers
        (weighted by USDC spent), and 15% to the platform for infrastructure.
        Distribution amounts will show once the treasury contract is deployed on Base mainnet.
      </div>
    </div>
  );
}
