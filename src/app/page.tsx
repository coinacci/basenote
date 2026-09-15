"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { PaymentModal } from "@/components/article/PaymentModal";
import type { Article } from "@/types";

function usdcToHuman(val: bigint | string): string {
  const n = typeof val === "bigint" ? val : BigInt(String(val));
  const human = Number(n) / 1_000_000;
  return human.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 6 });
}

function slug(cat: string): string {
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function HomePage() {
  const { address } = useAccount();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("cat");
    setActiveCategory(cat);
  }, []);

  useEffect(() => {
    fetch("/api/articles")
      .then((r) => r.json())
      .then((data) => { setArticles(data.articles || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Kategori filtresi
  const filtered = activeCategory
    ? articles.filter((a) => slug(a.category) === activeCategory)
    : articles;

  const featured = filtered[0] || null;
  const sidebar = filtered.slice(1, 5);
  const middle = filtered.slice(0, 3);
  const sorted = [...filtered].sort((a, b) => b.readCount - a.readCount);

  const openArticle = (article: Article) => {
    window.location.href = "/article/" + article.id;
  };

  if (loading) {
    return (
      <div className="main" style={{ paddingTop: "4rem", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-sub)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em", fontSize: ".85rem" }}>Loading...</div>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="main" style={{ paddingTop: "4rem", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", color: "var(--ink)", marginBottom: "1rem", textTransform: "uppercase" }}>
          {activeCategory ? "No articles in this category yet." : "No articles yet."}
        </div>
        {activeCategory && (
          <div style={{ fontFamily: "var(--font-body)", fontSize: ".85rem", color: "var(--muted)", marginBottom: "1.5rem" }}>
            Category: <strong>{activeCategory}</strong>
          </div>
        )}
        <a className="btn-write" href="/dashboard" style={{ padding: ".6rem 1.5rem", display: "inline-block" }}>Write</a>
      </div>
    );
  }

  return (
    <>
      <div className="date-bar">
        <div className="date-inner">
          <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
          {activeCategory && (
            <span style={{ fontFamily: "var(--font-sub)", fontSize: ".72rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".08em" }}>
              {activeCategory} · <a href="/" style={{ color: "var(--muted)", textDecoration: "underline" }}>All</a>
            </span>
          )}
        </div>
      </div>

      <div className="main" style={{ paddingTop: "1.5rem" }}>
        <div style={{ background: "var(--accent)", padding: ".4rem .75rem", marginBottom: "1.5rem", display: "inline-block" }}>
          <span style={{ fontFamily: "var(--font-sub)", fontSize: ".82rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--accent-text)" }}>
            {activeCategory ? activeCategory.replace(/-/g, " ") : "Featured"}
          </span>
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

      {!activeCategory && middle.length > 0 && (
        <>
          <div style={{ background: "var(--accent)", padding: ".4rem 1.5rem", margin: "1.5rem 0 0" }}>
            <span style={{ fontFamily: "var(--font-sub)", fontSize: ".82rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--accent-text)" }}>This Week</span>
          </div>
          <div className="main">
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
          </div>
        </>
      )}

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
