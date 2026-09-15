"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { usdcToHuman } from "@/hooks/useX402Payment";
import type { Article } from "@/types";
import { RichEditor } from "@/components/ui/RichEditor";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function usdcWei(amount: number): string {
  return String(Math.round(amount * 1_000_000));
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("1");
  const [category, setCategory] = useState("DeFi");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [myArticles, setMyArticles] = useState<Article[]>([]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!address) return;
    fetch("/api/articles")
      .then((r) => r.json())
      .then((data) => {
        const mine = (data.articles || []).filter(
          (a: Article) => a.author.toLowerCase() === address.toLowerCase()
        );
        setMyArticles(mine);
      });
  }, [address]);

  const handlePublish = async () => {
    if (!title || !content || !price || !address) return;
    setPublishing(true);
    setMsg("");
    setError("");

    const id = generateId();
    const article = {
      id,
      articleId: ("0x" + id.padEnd(64, "0").slice(0, 64)),
      title,
      excerpt: excerpt || title,
      content,
      author: address,
      authorAlias: address.slice(0, 6) + "..." + address.slice(-4),
      priceUsdc: usdcWei(parseFloat(price)),
      readCount: 0,
      category,
      publishedAt: Math.floor(Date.now() / 1000),
    };

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(article),
      });
      const data = await res.json();
      if (data.success) {
        setMyArticles((prev) => [article as unknown as Article, ...prev]);
        setMsg("Article published!");
        setTitle(""); setExcerpt(""); setContent(""); setPrice("1");
      } else {
        setError(data.error || "Failed to publish");
      }
    } catch {
      setError("Network error");
    } finally {
      setPublishing(false);
    }
  };

  if (!mounted) return null;

  if (!isConnected) {
    return (
      <div className="main" style={{ paddingTop: "3rem", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-sub)", color: "var(--muted)", fontSize: ".9rem", textTransform: "uppercase", letterSpacing: ".05em" }}>
          Connect your wallet to access the dashboard.
        </div>
      </div>
    );
  }

  return (
    <div className="main" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div style={{ background: "var(--accent)", padding: ".4rem .75rem", marginBottom: "1.5rem", display: "inline-block" }}>
        <span style={{ fontFamily: "var(--font-sub)", fontSize: ".82rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--accent-text)" }}>Writer Dashboard</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Articles Published", value: myArticles.length.toString() },
          { label: "Total Reads", value: myArticles.reduce((a, b) => a + b.readCount, 0).toString() },
          { label: "Wallet", value: address?.slice(0, 6) + "..." + address?.slice(-4) },
        ].map((s) => (
          <div key={s.label} style={{ border: "1px solid var(--gray-2)", padding: "1rem 1.2rem" }}>
            <div style={{ fontFamily: "var(--font-sub)", fontSize: ".68rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".3rem" }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "var(--ink)" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="col-label" style={{ marginBottom: "1.2rem" }}>Publish New Article</div>
      <div style={{ border: "1px solid var(--gray-2)", padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label className="form-label">Title</label>
            <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article title" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem" }}>
            <div>
              <label className="form-label">Price (USDC)</label>
              <input className="form-input" type="number" min="0.1" step="0.1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 2" />
            </div>
            <div>
              <label className="form-label">Category</label>
              <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {["DeFi", "AI x Web3", "Protocol", "NFT", "Guide", "Opinion", "Technical"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label className="form-label">Excerpt</label>
          <textarea className="form-input" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short description (shown on homepage)" />
        </div>

        <div style={{ marginBottom: "1.2rem" }}>
          <label className="form-label">Content</label>
          <RichEditor
            value={content}
            onChange={setContent}
            placeholder="Article content — only visible after payment"
          />
        </div>

        {msg && <div style={{ fontFamily: "var(--font-body)", fontSize: ".78rem", color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: ".6rem", marginBottom: "1rem" }}>{msg}</div>}
        {error && <div style={{ fontFamily: "var(--font-body)", fontSize: ".78rem", color: "#991b1b", background: "#fef2f2", border: "1px solid #fecaca", padding: ".6rem", marginBottom: "1rem" }}>{error}</div>}

        <button
          className="btn-write"
          style={{ padding: ".5rem 1.5rem", cursor: "pointer", opacity: (!title || !content || publishing) ? 0.5 : 1 }}
          onClick={handlePublish}
          disabled={!title || !content || publishing}
        >
          {publishing ? "Publishing..." : "Publish"}
        </button>
      </div>

      <div className="col-label" style={{ marginBottom: "1rem" }}>My Articles</div>
      {myArticles.length === 0 ? (
        <div style={{ fontFamily: "var(--font-body)", fontSize: ".85rem", color: "var(--muted)" }}>No articles yet.</div>
      ) : (
        myArticles.map((a) => (
          <div key={a.id} className="list-item">
            <div style={{ flex: 1 }}>
              <div className="list-title">{a.title}</div>
              <div className="list-meta-txt">{a.category} · {a.readCount} reads · {usdcToHuman(BigInt(a.priceUsdc))} USDC</div>
            </div>
            <div className="list-price">{usdcToHuman(BigInt(a.priceUsdc))} USDC</div>
          </div>
        ))
      )}
    </div>
  );
}
