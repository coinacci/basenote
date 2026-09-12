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

  const featured = MOCK_ARTICLES[0];
  const sidebar = MOCK_ARTICLES.slice(1, 5);
  const middle = MOCK_ARTICLES.slice(0, 3);

  const handlePurchaseSuccess = () => {
    if (selectedArticle) {
      setPurchased((prev) => new Set(prev).add(selectedArticle.id));
    }
    setTimeout(() => setSelectedArticle(null), 1500);
  };

  const openArticle = (article: Article) => {
    if (purchased.has(article.id)) return; // zaten satın alınmış
    setSelectedArticle(article);
  };

  return (
    <>
      <div className="date-bar">
        <div className="date-inner">
          <span>{new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
          <span>
            Kasa bu ay: <span className="t-num">—</span> &mdash; sonraki dağıtım yaklaşıyor
          </span>
        </div>
      </div>

      <div className="main">
        <div className="section-label">Öne çıkan</div>

        <div className="featured-row">
          <div className="featured-main">
            <div className="featured-tag">{featured.category}</div>
            <div className="featured-title" onClick={() => openArticle(featured)}>
              {featured.title}
            </div>
            <div className="featured-dek">{featured.excerpt}</div>
            <div className="article-meta">
              <div className="meta-left">
                <div className="author-dot">
                  {featured.authorAlias[0].toUpperCase()}
                </div>
                <span className="author-name">{featured.authorAlias}</span>
                <span className="read-time">&nbsp;·&nbsp;8 dk okuma</span>
              </div>
              <div className="price-tag" onClick={() => openArticle(featured)}>
                {purchased.has(featured.id) ? "✓ Okundu" : `${usdcToHuman(featured.priceUsdc)} USDC`}
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
                    <span className="sidebar-author">
                      {a.authorAlias} · {Math.ceil(a.excerpt.length / 200 + 3)} dk
                    </span>
                    <div className="price-tag" style={{ fontSize: ".68rem", padding: ".18rem .5rem" }}>
                      {purchased.has(a.id) ? "✓" : `${usdcToHuman(a.priceUsdc)} USDC`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="section-label">Bu hafta</div>
        <div className="mid-section">
          {middle.map((a) => (
            <div key={a.id} className="mid-card" onClick={() => openArticle(a)}>
              <div className="mid-tag">{a.category}</div>
              <div className="mid-title">{a.title}</div>
              <div className="mid-dek">{a.excerpt}</div>
              <div className="article-meta">
                <span className="author-name" style={{ fontSize: ".72rem" }}>
                  {a.authorAlias}
                </span>
                <div className="price-tag" style={{ fontSize: ".68rem", padding: ".18rem .5rem" }}>
                  {purchased.has(a.id) ? "✓ Okundu" : `${usdcToHuman(a.priceUsdc)} USDC`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TreasuryStrip />

      <div className="main">
        <div className="bottom-row">
          <div>
            <div className="col-label">Trending yazılar</div>
            {MOCK_ARTICLES.sort((a, b) => b.readCount - a.readCount).map((a, i) => (
              <div key={a.id} className="list-item" onClick={() => openArticle(a)}>
                <div className="list-num">{i + 1}</div>
                <div>
                  <div className="list-title">
                    {a.title}
                    <span className="list-price">{usdcToHuman(a.priceUsdc)} USDC</span>
                  </div>
                  <div className="list-meta-txt">
                    {a.authorAlias} · {a.readCount} okuma
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="col-label">Bu ay — yazar sıralaması</div>
            {[
              { alias: "coinacci.base.eth", addr: "0x4a2b…f8c1", earned: "3.240", reads: "847", color: "#b8952a" },
              { alias: "aibuilder.eth", addr: "0x7c8d…22a4", earned: "2.180", reads: "612", color: "#9ca3af" },
              { alias: "artblock.eth", addr: "0x9e1f…b3d7", earned: "1.870", reads: "431", color: "#9ca3af" },
              { alias: "writer.eth", addr: "0x3a5e…91c2", earned: "1.420", reads: "389", color: "#d1d5db" },
              { alias: "defidev.eth", addr: "0x1b7c…44f9", earned: "980", reads: "287", color: "#d1d5db" },
            ].map((lb, i) => (
              <div key={lb.alias} className="lb-item">
                <div className="lb-rank" style={{ color: lb.color }}>{i + 1}</div>
                <div className="lb-dot" style={{ background: "#dbeafe", color: "#1d4ed8" }}>
                  {lb.alias[0].toUpperCase()}
                </div>
                <div className="lb-info">
                  <div className="lb-name">{lb.alias}</div>
                  <div className="lb-addr">{lb.addr}</div>
                </div>
                <div>
                  <div className="lb-earn">{lb.earned} USDC</div>
                  <div className="lb-reads">{lb.reads} okuma</div>
                </div>
              </div>
            ))}
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
