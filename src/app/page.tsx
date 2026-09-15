"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { PaymentModal } from "@/components/article/PaymentModal";
import { TreasuryStrip } from "@/components/ui/TreasuryStrip";
import type { Article } from "@/types";

function usdcToHuman(val: bigint | string): string {
  const n = typeof val === "bigint" ? val : BigInt(String(val));
  const human = Number(n) / 1_000_000;
  return human.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 6 });
}

export default function HomePage() {
  const { address } = useAccount();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/articles")
      .then((r) => r.json())
      .then((data) => { setArticles(data.articles || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const featured = articles[0] || null;
  const sidebar = articles.slice(1, 5);
  const middle = articles.slice(0, 3);
  const sorted = [...articles].sort((a, b) => b.readCount - a.readCount);

  const openArticle = (article: Article) => {
    window.location.href = `/article/${article.id}`;
  };

  if (loading) {
    return (
      <>
        <div className="date-bar"><div className="date-inner"><span>September 15, 2026</span></div></div>
        <div className="main" style={{ paddingTop: "4rem", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-sub)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em", fontSize: ".85rem" }}>Loading...</div>
        </div>
      </>
    );
  }

  if (articles.length === 0) {
    return (
      <>
        <div className="date-bar">
          <div className="date-inner">
            <span>September 15, 2026</span>
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
          </div>
        </div>
        <div className="main" style={{ paddingTop: "4rem", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", color: "var(--ink)", marginBottom: "1rem", textTransform: "uppercase" }}>No articles yet.</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: ".85rem", color: "var(--muted)", marginBottom: "2rem" }}>Be the first to publish.</div>
          <a className="btn-write" href="/dashboard" style={{ padding: ".6rem 1.5rem", display: "inline-block" }}>Write</a>
        </div>
        <TreasuryStrip />
      </>
    );
  }

  return (
    <>
      <div className="date-bar">
        <div className="date-inner">
          <span>September 15, 2026</span>
          <span>TREASURY THIS MONTH: <span className="t-num">{treasury} USDC</span></span>
        </div>
      </div>

      <div className="main" style={{ paddingTop: "1.5rem" }}>
        <div style={{ background: "var(--accent)", padding: ".4rem .75rem", marginBottom: "1.5rem", display: "inline-block" }}>
          <span style={{ fontFamily: "var(--font-sub)", fontSize: ".82rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--accent-text)" }}>Featured</span>
        </div>

        {featured && (
          <div className="featured-row">
            <div className="featured-main">
              <div className="featured-tag">{featured.category}</div>
              <div className="featured-title" onClick={() => openArticle(featured)}>{featured.title}</div>
              <div className="featured-dek">{featured.excerpt}</div>
              <div className="article-meta">
                <div className="meta-left">
                  <div className="author-dot">{featured.authorAlias[0].toUpperCase()}</div>
                  <span className="author-name">{featured.authorAlias}</span>
                  <span className="read-time">&nbsp;·&nbsp;8 min read</span>
                </div>
                <div className="price-tag" onClick={() => openArticle(featured)}>
                  {usdcToHuman(featured.priceUsdc)} USDC
                </div>
              </div>
            </div>
            <div className="sidebar">
              <div className="sidebar-list">
                {sidebar.map((a) => (
                  <div key={a.id} className="sidebar-item" onClick={() => openArticle(a)}>
                    <div className="sidebar-tag">{a.category}</div>
                    <div className="sidebar-title">{a.title}</div>
                    <div className="sidebar-meta">
                      <span className="sidebar-author">{a.authorAlias}</span>
                      <div className="price-tag" style={{ fontSize: ".68rem", padding: ".18rem .5rem" }}>
                        {usdcToHuman(a.priceUsdc)} USDC
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ background: "var(--accent)", padding: ".4rem 1.5rem", margin: "1.5rem 0 0" }}>
        <span style={{ fontFamily: "var(--font-sub)", fontSize: ".82rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--accent-text)" }}>This Week</span>
      </div>

      <div className="main">
        {middle.length > 0 && (
          <div className="mid-section">
            {middle.map((a) => (
              <div key={a.id} className="mid-card" onClick={() => openArticle(a)}>
                <div className="mid-tag">{a.category}</div>
                <div className="mid-title">{a.title}</div>
                <div className="mid-dek">{a.excerpt}</div>
                <div className="article-meta">
                  <span className="author-name" style={{ fontSize: ".72rem" }}>{a.authorAlias}</span>
                  <div className="price-tag" style={{ fontSize: ".68rem", padding: ".18rem .5rem" }}>
                    {usdcToHuman(a.priceUsdc)} USDC
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TreasuryStrip />

      <div className="main">
        <div className="bottom-row">
          <div>
            <div className="col-label">Trending</div>
            {sorted.map((a, i) => (
              <div key={a.id} className="list-item" onClick={() => openArticle(a)}>
                <div className="list-num">{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div className="list-title">{a.title} <span className="list-price">{usdcToHuman(a.priceUsdc)} USDC</span></div>
                  <div className="list-meta-txt">{a.authorAlias} · {a.readCount} reads</div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="col-label">Top Authors This Month</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: ".85rem", color: "var(--muted)", paddingTop: ".5rem" }}>
              Rankings will appear once articles are published.
            </div>
          </div>
        </div>
      </div>

      {selectedArticle && (
        <PaymentModal
          article={selectedArticle}
          onSuccess={() => {}}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </>
  );
}
