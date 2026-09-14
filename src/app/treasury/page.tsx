"use client";

import { useTreasury } from "@/hooks/useTreasury";

export default function TreasuryPage() {
  const { balanceHuman, countdownStr } = useTreasury();

  const rows = [
    { label: "Platform", pct: 15, color: "var(--ink)", desc: "Infrastructure & development" },
    { label: "Authors", pct: 70, color: "var(--crimson)", desc: "Weighted by USDC earned" },
    { label: "Readers", pct: 15, color: "var(--gold)", desc: "Top spenders this cycle" },
  ];

  return (
    <div className="main" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div style={{ background: "var(--gold)", padding: ".4rem .75rem", marginBottom: "1.5rem", display: "inline-block" }}>
        <span style={{ fontFamily: "var(--font-sub)", fontSize: ".82rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#0a0a0a" }}>Treasury</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total Balance", value: balanceHuman + " USDC" },
          { label: "Next Distribution", value: countdownStr },
          { label: "Active Authors", value: "—" },
        ].map((s) => (
          <div key={s.label} style={{ border: "1px solid var(--gray-2)", padding: "1rem 1.2rem" }}>
            <div style={{ fontFamily: "var(--font-sub)", fontSize: ".68rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".3rem" }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", color: "var(--ink)" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="col-label" style={{ marginBottom: "1rem" }}>Distribution Breakdown</div>
      <div style={{ border: "1px solid var(--gray-2)", padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: ".1rem", height: "10px", marginBottom: "1.2rem", overflow: "hidden" }}>
          {rows.map((r) => (
            <div key={r.label} style={{ width: r.pct + "%", height: "100%", background: r.color }} />
          ))}
        </div>
        {rows.map((r) => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".7rem 0", borderBottom: "1px solid var(--gray)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: r.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "var(--font-sub)", fontSize: ".85rem", fontWeight: 600, color: "var(--ink)", textTransform: "uppercase" }}>{r.label}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: ".72rem", color: "var(--muted)" }}>{r.desc}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "var(--ink)" }}>{r.pct}%</span>
              <span style={{ fontFamily: "var(--font-sub)", fontSize: ".85rem", color: "var(--muted)" }}>
                {balanceHuman !== "0" ? ((Number(balanceHuman) * r.pct) / 100).toFixed(2) + " USDC" : "—"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: "var(--font-body)", fontSize: ".82rem", color: "var(--muted)", lineHeight: 1.7, borderLeft: "3px solid var(--gold)", paddingLeft: "1rem" }}>
        <strong style={{ color: "var(--ink)", fontFamily: "var(--font-sub)", textTransform: "uppercase", letterSpacing: ".05em" }}>How it works</strong><br />
        Every read payment goes directly into this treasury. At the end of each month,
        the smart contract automatically calculates author shares based on USDC earned,
        and reader rewards based on total spending. Authors who charge more and get read more earn proportionally more.
      </div>
    </div>
  );
}
