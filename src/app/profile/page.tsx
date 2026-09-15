"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import type { Article } from "@/types";

function usdcToHuman(val: string | number): string {
  const n = parseFloat(String(val));
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

interface ProfileData {
  spent: number;
  rewardShare: number;
  totalReaderSpending: number;
  readerPool: number;
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [profile, setProfile] = useState<ProfileData>({ spent: 0, rewardShare: 0, totalReaderSpending: 0, readerPool: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!address) return;

    // Stats + treasury verisi
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        const balance = data.balance || 0;
        const readerPool = +(balance * 0.15).toFixed(2);
        const totalReaderSpending = data.distribution?.totalReaderSpending || 0;
        const me = (data.distribution?.readers || []).find(
          (r: { address: string; spent: number; share: number }) =>
            r.address.toLowerCase() === address.toLowerCase()
        );
        setProfile({
          spent: me?.spent || 0,
          rewardShare: me?.share || 0,
          totalReaderSpending,
          readerPool,
        });
      });

    // Satın alınan makaleleri bul
    fetch("/api/articles")
      .then((r) => r.json())
      .then(async (data) => {
        const allArticles: Article[] = data.articles || [];
        const purchased: Article[] = [];

        await Promise.all(
          allArticles.map(async (a) => {
            const res = await fetch(`/api/access?articleId=${a.articleId}&address=${address}`);
            const d = await res.json();
            if (d.hasAccess) purchased.push(a);
          })
        );

        setArticles(purchased);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [address]);

  if (!mounted) return null;

  if (!isConnected) {
    return (
      <div className="main" style={{ paddingTop: "3rem", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-sub)", color: "var(--muted)", fontSize: ".9rem", textTransform: "uppercase", letterSpacing: ".05em" }}>
          Connect your wallet to view your profile.
        </div>
      </div>
    );
  }

  return (
    <div className="main" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div style={{ background: "var(--accent)", padding: ".4rem .75rem", marginBottom: "1.5rem", display: "inline-block" }}>
        <span style={{ fontFamily: "var(--font-sub)", fontSize: ".82rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--accent-text)" }}>Profile</span>
      </div>

      {/* Cüzdan */}
      <div style={{ border: "2px solid var(--ink)", padding: "1.2rem 1.5rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--badge)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontSize: "1rem", color: "#fff", flexShrink: 0 }}>
          {address?.slice(2, 4).toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-sub)", fontSize: ".72rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".2rem" }}>Connected Wallet</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--ink)" }}>{address}</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Articles Purchased", value: loading ? "—" : articles.length.toString() },
          { label: "USDC Spent This Cycle", value: loading ? "—" : usdcToHuman(profile.spent) + " USDC" },
          { label: "Reward This Cycle", value: loading ? "—" : usdcToHuman(profile.rewardShare) + " USDC" },
        ].map((s) => (
          <div key={s.label} style={{ border: "1px solid var(--gray-2)", padding: "1rem 1.2rem" }}>
            <div style={{ fontFamily: "var(--font-sub)", fontSize: ".68rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".3rem" }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "var(--ink)" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Ödül hesabı */}
      {profile.spent > 0 && (
        <div style={{ background: "var(--gray)", border: "1px solid var(--gray-2)", padding: "1rem 1.2rem", marginBottom: "2rem" }}>
          <div style={{ fontFamily: "var(--font-sub)", fontSize: ".72rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".5rem" }}>Reward Calculation</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: ".82rem", color: "var(--muted)", lineHeight: 1.8 }}>
            Your spending: <strong style={{ color: "var(--ink)" }}>{usdcToHuman(profile.spent)} USDC</strong><br />
            Total reader spending: <strong style={{ color: "var(--ink)" }}>{usdcToHuman(profile.totalReaderSpending)} USDC</strong><br />
            Reader pool: <strong style={{ color: "var(--ink)" }}>{usdcToHuman(profile.readerPool)} USDC</strong><br />
            Your share: <strong style={{ color: "var(--badge)" }}>({usdcToHuman(profile.spent)} / {usdcToHuman(profile.totalReaderSpending)}) × {usdcToHuman(profile.readerPool)} = <span style={{ color: "var(--badge)", fontFamily: "var(--font-heading)", fontSize: "1rem" }}>{usdcToHuman(profile.rewardShare)} USDC</span></strong>
          </div>
        </div>
      )}

      {/* Satın alınan makaleler */}
      <div className="col-label" style={{ marginBottom: "1rem" }}>Purchased Articles</div>
      {loading ? (
        <div style={{ fontFamily: "var(--font-body)", fontSize: ".85rem", color: "var(--muted)" }}>Loading...</div>
      ) : articles.length === 0 ? (
        <div style={{ fontFamily: "var(--font-body)", fontSize: ".85rem", color: "var(--muted)" }}>
          No articles purchased yet. <a href="/" style={{ color: "var(--badge)", textDecoration: "underline" }}>Explore articles →</a>
        </div>
      ) : (
        articles.map((a) => (
          <div
            key={a.id}
            className="list-item"
            onClick={() => window.location.href = `/article/${a.id}`}
            style={{ cursor: "pointer" }}
          >
            <div style={{ flex: 1 }}>
              <div className="list-title">{a.title}</div>
              <div className="list-meta-txt">{a.category} · By {a.authorAlias} · {typeof a.priceUsdc === "string" ? usdcToHuman(parseFloat(a.priceUsdc) / 1_000_000) : ""} USDC</div>
            </div>
            <div style={{ fontFamily: "var(--font-sub)", fontSize: ".75rem", color: "var(--badge)", textTransform: "uppercase" }}>Read →</div>
          </div>
        ))
      )}
    </div>
  );
}
