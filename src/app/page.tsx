"use client";

import { useState } from "react";
import { MOCK_ARTICLES } from "@/lib/articles";
import { usdcToHuman } from "@/hooks/useX402Payment";
import { PaymentModal } from "@/components/article/PaymentModal";
import { TreasuryStrip } from "@/components/ui/TreasuryStrip";
import type { Article } from "@/types";

export default function HomePage() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [purchased, setPurchased] = useState<Set<string>>(new Set());

  const articles = MOCK_ARTICLES;
  const featured = articles[0] || null;
  const sidebar = articles.slice(1, 5);
  const middle = articles.slice(0, 3);
  const sorted = [...articles].sort((a, b) => b.readCount - a.readCount);

  const handlePurchaseSuccess = () => {
    if (selectedArticle) setPurchased((prev) => new Set(prev).add(selectedArticle.id));
    setTimeout(() => setSelectedArticle(null), 1500);
  };

  const openArticle = (article: Article) => {
    if (purchased.has(article.id)) return;
    setSelectedArticle(article);
  };

  if (articles.length === 0) {
    return (
      <>
        <div className="date-bar">
          <div className="date-inner">
            <span>14 Eylul 2026</span>
            <span>Kasa bu ay: <span className="t-num">—</span></span>
          </div>
        </div>
        <div className="main" style={{ paddingTop: "4rem", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", color: "var(--ink)", marginBottom: "1rem", textTransform: "uppercase" }}>
            Henuz yazi yok.
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: ".85rem", color: "var(--muted)", marginBottom: "2rem" }}>
            Ilk yaziyi yazmak ister misin?
          </div>
          <a className="btn-write" href="/dashboard" style={{ padding: ".6rem 1.5rem", display: "inline-block" }}>
            Yazi yaz
          </a>
        </div>
        <TreasuryStrip />
      </>
    );
  }

  return (
    <>
      <div className="date-bar">
        <div className="date-inner">
          <span>14 Eylul 2026</span>
          <span>KASA BU AY: <span className="t-num">— USDC</span> — 18 GUNDE DAGITILACAK</span>
        </div>
      </div>

      <div className="main" style={{ paddingTop: "1.5rem" }}>
        <div style={{ background: "var(--gold)", padding: ".4rem .75rem", marginBottom: "1.5rem", display: "inline-block" }}>
          <span style={{ fontFamily: "var(--font-sub)", fontSize: ".82rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#0a0a0a" }}>One Cikan</span>
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
                  <span className="read-time">&nbsp;·&nbsp;8 dk okuma</span>
                </div>
                <div className="price-tag" onClick={() => openArticle(featured)}>
                  {purchased.has(featured.id) ? "✓ OKUNDU" : `${usdcToHuman(featured.priceUsdc)} USDC`}
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
                      <span className="sidebar-author">{a.authorAlias} · {Math.ceil(a.excerpt.length / 200 + 3)} dk</span>
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

      <div style={{ background: "var(--gold)", padding: ".4rem 1.5rem", margin: "1.5rem 0 0" }}>
        <span style={{ fontFamily: "var(--font-sub)", fontSize: ".82rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#0a0a0a" }}>Bu Hafta</span>
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
                  <span className="author-name" style={{ fontSize: ".72rem" }}>{a.authorAlias} · {Math.ceil(a.excerpt.length / 200 + 3)} dk</span>
                  <div className="price-tag" style={{ fontSize: ".68rem", padding: ".18rem .5rem" }}>
                    {purchased.has(a.id) ? "✓ OKUNDU" : `${usdcToHuman(a.priceUsdc)} USDC`}
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
            <div className="col-label">Trending Yazilar</div>
            {sorted.map((a, i) => (
              <div key={a.id} className="list-item" onClick={() => openArticle(a)}>
                <div className="list-num">{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div className="list-title">{a.title} <span className="list-price">{usdcToHuman(a.priceUsdc)} USDC</span></div>
                  <div className="list-meta-txt">{a.authorAlias} · {a.readCount} okuma</div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="col-label">Bu Ay — Yazar Siralaması</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: ".85rem", color: "var(--muted)", paddingTop: ".5rem" }}>
              Ilk yazilar yayinlandiktan sonra siralama olusacak.
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
