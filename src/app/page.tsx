"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { PaymentModal } from "@/components/article/PaymentModal";
import { TreasuryStrip } from "@/components/ui/TreasuryStrip";
import type { Article } from "@/types";

function usdcToHuman(val: bigint | string): string {
  const n = typeof val === "bigint" ? val : BigInt(val);
  const human = Number(n) / 1_000_000;
  return human % 1 === 0 ? human.toFixed(0) : human.toFixed(2);
}

export default function HomePage() {
  const { address } = useAccount();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [purchased, setPurchased] = useState<Set<string>>(new Set());
  const [articleContent, setArticleContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/articles")
      .then((r) => r.json())
      .then((data) => { setArticles(data.articles || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!address || articles.length === 0) return;
    Promise.all(
      articles.map(async (a) => {
        const res = await fetch(`/api/access?articleId=${a.articleId}&address=${address}`);
        const data = await res.json();
        return data.hasAccess ? a.id : null;
      })
    ).then((results) => {
      const ids = results.filter(Boolean) as string[];
      if (ids.length > 0) setPurchased(new Set(ids));
    });
  }, [address, articles]);

  const featured = articles[0] || null;
  const sidebar = articles.slice(1, 5);
  const middle = articles.slice(0, 3);
  const sorted = [...articles].sort((a, b) => b.readCount - a.readCount);

  const handlePurchaseSuccess = (content: string) => {
    if (selectedArticle) {
      setPurchased((prev) => new Set(prev).add(selectedArticle.id));
      setArticleContent((prev) => ({ ...prev, [selectedArticle.id]: content }));
    }
    setSelectedArticle(null);
  };

  const openArticle = (article: Article) => {
    if (purchased.has(article.id)) {
      // İçerik zaten var mı?
      if (articleContent[article.id]) {
        alert(articleContent[article.id]); // Geçici — ileride article page yapacağız
      }
      return;
    }
    setSelectedArticle(article);
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
            <span>Treasury this month: <span className="t-num">—</span></span>
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
          <span>TREASURY THIS MONTH: <span className="t-num">— USDC</span> — DISTRIBUTED IN 18 DAYS</span>
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
                  {purchased.has(featured.id) ? "✓ READ" : `${usdcToHuman(featured.priceUsdc)} USDC`}
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
                        {purchased.has(a.id) ? "✓" : `${usdcToHuman(a.priceUsdc)} USDC`}
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
                    {purchased.has(a.id) ? "✓ READ" : `${usdcToHuman(a.priceUsdc)} USDC`}
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
          onSuccess={handlePurchaseSuccess}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </>
  );
}
