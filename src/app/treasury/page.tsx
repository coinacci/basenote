"use client";

import { useTreasury } from "@/hooks/useTreasury";

export default function TreasuryPage() {
  const { balanceHuman, countdownStr } = useTreasury();

  const rows = [
    { label: "Platform", bps: 26, color: "#111" },
    { label: "Yazarlar", bps: 56, color: "#0052FF" },
    { label: "Okuyucular", bps: 18, color: "#bbb" },
  ];

  return (
    <div className="main" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div className="section-label">Kasa</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Toplam bakiye", value: balanceHuman + " USDC" },
          { label: "Sonraki dağıtım", value: countdownStr },
          { label: "Aktif yazar", value: "—" },
        ].map((s) => (
          <div key={s.label} style={{ border: "1px solid #e5e5e5", padding: "1rem 1.2rem" }}>
            <div style={{ fontFamily: "system-ui", fontSize: ".68rem", color: "#888", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".3rem" }}>{s.label}</div>
            <div style={{ fontFamily: "Lora, Georgia, serif", fontSize: "1.3rem", fontWeight: 600 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="col-label" style={{ marginBottom: "1rem" }}>Dağıtım oranları</div>
      <div style={{ border: "1px solid #e5e5e5", padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: ".1rem", height: "8px", marginBottom: "1rem", overflow: "hidden" }}>
          {rows.map((r) => (
            <div key={r.label} style={{ width: r.bps + "%", height: "100%", background: r.color }} />
          ))}
        </div>
        {rows.map((r) => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: ".6rem 0", borderBottom: "1px solid #f5f5f5" }}>
            <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: r.color, flexShrink: 0 }} />
              <span style={{ fontFamily: "system-ui", fontSize: ".85rem", color: "#111" }}>{r.label}</span>
            </div>
            <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
              <span style={{ fontFamily: "system-ui", fontSize: ".85rem", fontWeight: 600, color: "#111" }}>%{r.bps}</span>
              <span style={{ fontFamily: "Lora, Georgia, serif", fontSize: ".85rem", color: "#555" }}>
                {balanceHuman !== "0" ? ((Number(balanceHuman) * r.bps) / 100).toFixed(2) + " USDC" : "—"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: "system-ui", fontSize: ".8rem", color: "#888", lineHeight: 1.7, borderLeft: "2px solid #e5e5e5", paddingLeft: "1rem" }}>
        <strong style={{ color: "#111" }}>Dağıtım nasıl çalışır?</strong><br />
        Her okuma ödemesi doğrudan bu kasaya girer. Ay sonunda akıllı kontrat otomatik olarak
        platform payını, yazar havuzunu ve okuyucu ödüllerini hesaplar.
        Yazarlar okuma sayısına göre, okuyucular harcama miktarına göre pay alır.
      </div>
    </div>
  );
}
