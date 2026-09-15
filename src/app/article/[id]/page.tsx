"use client";

import { useState, useEffect, use } from "react";
import { useAccount } from "wagmi";
import { PaymentModal } from "@/components/article/PaymentModal";
import type { Article } from "@/types";

function usdcToHuman(val: bigint | string): string {
  const n = typeof val === "bigint" ? val : BigInt(String(val));
  const human = Number(n) / 1_000_000;
  return human.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 6 });
}

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { address } = useAccount();
  const [article, setArticle] = useState<Article | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Makaleyi getir
  useEffect(() => {
    fetch("/api/articles")
      .then((r) => r.json())
      .then((data) => {
        const found = (data.articles || []).find((a: Article) => a.id === id);
        setArticle(found || null);
        setLoading(false);
      });
  }, [id]);

  // Erişim kontrolü
  useEffect(() => {
    if (!address || !article) return;
    fetch(`/api/access?articleId=${article.articleId}&address=${address}`)
      .then((r) => r.json())
      .then(async (data) => {
        if (data.hasAccess) {
          setHasAccess(true);
          // İçeriği getir
          const contentRes = await fetch(
            `/api/content?articleId=${article.articleId}&address=${address}&id=${article.id}`
          );
          const contentData = await contentRes.json();
          setContent(contentData.content || "");
        }
      });
  }, [address, article]);

  const handlePaymentSuccess = (newContent: string) => {
    setHasAccess(true);
    setContent(newContent);
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="main" style={{ paddingTop: "4rem", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-sub)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em", fontSize: ".85rem" }}>Loading...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="main" style={{ paddingTop: "4rem", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", color: "var(--ink)", textTransform: "uppercase" }}>Article not found.</div>
      </div>
    );
  }

  return (
    <>
      <div className="main" style={{ paddingTop: "2rem", paddingBottom: "4rem", maxWidth: "680px" }}>

        {/* Breadcrumb */}
        <div style={{ fontFamily: "var(--font-body)", fontSize: ".75rem", color: "var(--muted)", marginBottom: "1.5rem" }}>
          <a href="/" style={{ color: "var(--muted)", textDecoration: "underline" }}>Home</a>
          {" → "}
          <span>{article.category}</span>
        </div>

        {/* Category */}
        <div className="featured-tag" style={{ marginBottom: "1rem" }}>{article.category}</div>

        {/* Title */}
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.4rem", lineHeight: 1.1, color: "var(--ink)", textTransform: "uppercase", marginBottom: "1rem" }}>
          {article.title}
        </h1>

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "1px solid var(--gray-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
            <div className="author-dot">{article.authorAlias[0].toUpperCase()}</div>
            <span style={{ fontFamily: "var(--font-body)", fontSize: ".8rem", color: "var(--muted)" }}>{article.authorAlias}</span>
          </div>
          <span style={{ fontFamily: "var(--font-body)", fontSize: ".75rem", color: "var(--muted)" }}>
            {new Date(article.publishedAt * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
          <div className="price-tag" style={{ fontSize: ".75rem" }}>
            {usdcToHuman(article.priceUsdc)} USDC
          </div>
        </div>

        {/* Excerpt — herkese görünür */}
        <p style={{ fontFamily: "var(--font-body)", fontSize: "1rem", color: "var(--muted)", lineHeight: 1.8, marginBottom: "2rem", borderLeft: "3px solid var(--accent)", paddingLeft: "1rem" }}>
          {article.excerpt}
        </p>

        {/* İçerik veya paywall */}
        {!mounted || !address ? (
          <div style={{ border: "2px solid var(--gray-2)", padding: "2rem", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "var(--ink)", textTransform: "uppercase", marginBottom: ".75rem" }}>Connect wallet to read</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: ".85rem", color: "var(--muted)" }}>Connect your EVM wallet to purchase and read this article.</div>
          </div>
        ) : hasAccess && content ? (
          <div style={{ fontFamily: "var(--font-body)", fontSize: "1rem", color: "var(--ink)", lineHeight: 1.9 }}>
            {content.split("\n").map((para, i) => (
              para.trim() ? (
                <p key={i} style={{ marginBottom: "1.25rem" }}>{para}</p>
              ) : (
                <br key={i} />
              )
            ))}
          </div>
        ) : (
          <div style={{ border: "2px solid var(--ink)", padding: "2rem", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "var(--ink)", textTransform: "uppercase", marginBottom: ".75rem" }}>
              Read for {usdcToHuman(article.priceUsdc)} USDC
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: ".85rem", color: "var(--muted)", marginBottom: "1.5rem" }}>
              One-time payment via x402 on Base. Pay once, read forever.
            </div>
            <button
              className="btn-pay"
              style={{ background: "var(--badge)", color: "#fff", border: "none", padding: ".7rem 2rem", fontFamily: "var(--font-sub)", fontSize: ".9rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer", borderRadius: "2px" }}
              onClick={() => setShowModal(true)}
            >
              UNLOCK ARTICLE — {usdcToHuman(article.priceUsdc)} USDC
            </button>
          </div>
        )}
      </div>

      {showModal && article && (
        <PaymentModal
          article={article}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
