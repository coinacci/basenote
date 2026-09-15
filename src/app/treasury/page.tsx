"use client";

import { useEffect, useState } from "react";

interface AuthorShare { address: string; earned: number; share: number; }
interface ReaderShare { address: string; spent: number; share: number; }
interface SaleDay { date: string; count: number; }

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = targetDate.getTime() - Date.now();
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
  }, [targetDate]);
  return timeLeft;
}

export default function TreasuryPage() {
  const [balance, setBalance] = useState(0);
  const [sales, setSales] = useState<SaleDay[]>([]);
  const [totalReads, setTotalReads] = useState(0);
  const [authors, setAuthors] = useState<AuthorShare[]>([]);
  const [readers, setReaders] = useState<ReaderShare[]>([]);
  const [loading, setLoading] = useState(true);

  const [target] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const countdown = useCountdown(target);
  const pad = (n: number) => String(n).padStart(2, "0");

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setBalance(data.balance || 0);
        setSales(data.sales || []);
        setTotalReads(data.total || 0);
        setAuthors(data.distribution?.authors || []);
        setReaders(data.distribution?.readers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const platform = +(balance * 0.15).toFixed(2);
  const authorPool = +(balance * 0.70).toFixed(2);
  const readerPool = +(balance * 0.15).toFixed(2);

  const rows = [
    { label: "Platform", pct: 15, color: "var(--ink)", desc: "Infrastructure & development", amount: platform },
    { label: "Authors", pct: 70, color: "var(--badge)", desc: "Weighted by USDC earned", amount: authorPool },
    { label: "Readers", pct: 15, color: "var(--accent)", desc: "Top spenders this cycle", amount: readerPool },
  ];

  const short = (addr: string) => addr.slice(0, 6) + "..." + addr.slice(-4);

  return (
    <div className="main" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div style={{ background: "var(--accent)", padding: ".4rem .75rem", marginBottom: "1.5rem", display: "inline-block" }}>
        <span style={{ fontFamily: "var(--font-sub)", fontSize: ".82rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--accent-text)" }}>Treasury</span>
      </div>

      {/* Bakiye + sayaç */}
      <div style={{ border: "2px solid var(--ink)", padding: "1.5rem 2rem", marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ fontFamily: "var(--font-sub)", fontSize: ".72rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: ".4rem" }}>Total Treasury Balance</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "2.8rem", color: "var(--ink)", lineHeight: 1 }}>
            {loading ? "—" : balance.toFixed(2)} <span style={{ fontSize: "1.2rem", color: "var(--muted)", fontFamily: "var(--font-sub)" }}>USDC</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-sub)", fontSize: ".72rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: ".6rem" }}>Next Distribution</div>
          <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
            {[{ val: countdown.days, label: "D" }, { val: countdown.hours, label: "H" }, { val: countdown.minutes, label: "M" }, { val: countdown.seconds, label: "S" }].map((t) => (
              <div key={t.label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", color: "var(--ink)", lineHeight: 1 }}>{pad(t.val)}</div>
                <div style={{ fontFamily: "var(--font-sub)", fontSize: ".6rem", color: "var(--muted)", letterSpacing: ".1em" }}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dağıtım */}
      <div className="col-label" style={{ marginBottom: "1rem" }}>Distribution Breakdown</div>
      <div style={{ border: "1px solid var(--gray-2)", marginBottom: "2rem" }}>
        <div style={{ display: "flex", height: "8px" }}>
          {rows.map((r) => <div key={r.label} style={{ width: r.pct + "%", height: "100%", background: r.color }} />)}
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
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "var(--ink)" }}>
              {r.amount.toFixed(2)} <span style={{ fontSize: ".75rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>USDC</span>
            </div>
          </div>
        ))}
      </div>

      {/* Yazar payları */}
      {authors.length > 0 && (
        <>
          <div className="col-label" style={{ marginBottom: "1rem" }}>Author Payouts</div>
          <div style={{ border: "1px solid var(--gray-2)", marginBottom: "2rem" }}>
            {authors.map((a, i) => (
              <div key={a.address} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".75rem 1.2rem", borderBottom: i < authors.length - 1 ? "1px solid var(--gray)" : "none" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-sub)", fontSize: ".8rem", color: "var(--ink)", textTransform: "uppercase" }}>{short(a.address)}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: ".68rem", color: "var(--muted)" }}>Earned {a.earned.toFixed(2)} USDC from reads</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "var(--badge)" }}>{a.share.toFixed(2)} USDC</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: ".68rem", color: "var(--muted)" }}>payout share</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Okuyucu payları */}
      {readers.length > 0 && (
        <>
          <div className="col-label" style={{ marginBottom: "1rem" }}>Reader Rewards</div>
          <div style={{ border: "1px solid var(--gray-2)", marginBottom: "2rem" }}>
            {readers.map((r, i) => (
              <div key={r.address} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".75rem 1.2rem", borderBottom: i < readers.length - 1 ? "1px solid var(--gray)" : "none" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-sub)", fontSize: ".8rem", color: "var(--ink)", textTransform: "uppercase" }}>{short(r.address)}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: ".68rem", color: "var(--muted)" }}>Spent {r.spent.toFixed(2)} USDC reading</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "var(--accent)" }}>{r.share.toFixed(2)} USDC</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: ".68rem", color: "var(--muted)" }}>reward share</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Günlük geçmiş */}
      {sales.length > 0 && (
        <>
          <div className="col-label" style={{ marginBottom: "1rem" }}>Daily Read History</div>
          <div style={{ border: "1px solid var(--gray-2)", marginBottom: "2rem" }}>
            {sales.map((s, i) => (
              <div key={s.date} style={{ display: "flex", justifyContent: "space-between", padding: ".65rem 1.2rem", borderBottom: i < sales.length - 1 ? "1px solid var(--gray)" : "none" }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: ".82rem", color: "var(--muted)" }}>{s.date}</span>
                <span style={{ fontFamily: "var(--font-sub)", fontSize: ".82rem", fontWeight: 600, color: "var(--ink)" }}>{s.count} reads</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ fontFamily: "var(--font-body)", fontSize: ".82rem", color: "var(--muted)", lineHeight: 1.7, borderLeft: "3px solid var(--accent)", paddingLeft: "1rem" }}>
        <strong style={{ color: "var(--ink)", fontFamily: "var(--font-sub)", textTransform: "uppercase", letterSpacing: ".05em" }}>How it works</strong><br />
        Every USDC payment flows into the treasury. At the end of each 7-day cycle,
        70% goes to authors (weighted by USDC earned), 15% to top readers (weighted by USDC spent),
        and 15% to the platform. Payouts shown above are calculated in real time.
      </div>
    </div>
  );
}
