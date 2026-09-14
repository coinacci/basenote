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
          <div style={{ fontFamily: "Lora, Georgia, serif", fontSize: "1.4rem", color: "var(--text)", marginBottom: "1rem" }}>
            Henuz yazi yok.
          </div>
          <div style={{ fontFamily: "system-ui", fontSize: ".85rem", color: "var(--text-muted)", marginBottom: "2rem" }}>
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
          <span>Kasa bu ay: <span className="t-num">—</span> — sonraki dagitim yaklisiyor</span>
        </div>
      </div>

      <div className="main">
        <div className="section-label">One cikan</div>
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
                  {purchased.has(featured.id) ? "Okundu" : `${usdcToHuman(featured.priceUsdc)} USDC`}
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

        {middle.length > 0 && (
          <>
            <div className="section-label">Bu hafta</div>
            <div className="mid-section">
              {middle.map((a) => (
                <div key={a.id} className="mid-card" onClick={() => openArticle(a)}>
                  <div className="mid-tag">{a.category}</div>
                  <div className="mid-title">{a.title}</div>
                  <div className="mid-dek">{a.excerpt}</div>
                  <div className="article-meta">
                    <span className="author-name" style={{ fontSize: ".72rem" }}>{a.authorAlias}</span>
                    <div className="price-tag" style={{ fontSize: ".68rem", padding: ".18rem .5rem" }}>
                      {purchased.has(a.id) ? "Okundu" : `${usdcToHuman(a.priceUsdc)} USDC`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <TreasuryStrip />

      <div className="main">
        <div className="bottom-row">
          <div>
            <div className="col-label">Trending yazilar</div>
            {sorted.map((a, i) => (
              <div key={a.id} className="list-item" onClick={() => openArticle(a)}>
                <div className="list-num">{i + 1}</div>
                <div>
                  <div className="list-title">{a.title} <span className="list-price">{usdcToHuman(a.priceUsdc)} USDC</span></div>
                  <div className="list-meta-txt">{a.authorAlias} · {a.readCount} okuma</div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="col-label">Bu ay — yazar siralaması</div>
            <div style={{ fontFamily: "system-ui", fontSize: ".85rem", color: "var(--text-muted)", paddingTop: ".5rem" }}>
              Ilk yazılar yayinlandiktan sonra siralama olusacak.
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
