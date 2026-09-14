"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { usdcToHuman } from "@/hooks/useX402Payment";
import { usdcWei } from "@/lib/articles";
import type { Article } from "@/types";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function loadMyArticles(address: string): Article[] {
  if (typeof window === "undefined") return [];
  try {
    const all = JSON.parse(localStorage.getItem("basenote_articles") || "[]");
    return all.filter((a: Article) => a.author.toLowerCase() === address.toLowerCase());
  } catch { return []; }
}

function saveArticle(article: Article) {
  if (typeof window === "undefined") return;
  const all = JSON.parse(localStorage.getItem("basenote_articles") || "[]");
  all.unshift(article);
  localStorage.setItem("basenote_articles", JSON.stringify(all));
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("1");
  const [category, setCategory] = useState("DeFi");
  const [msg, setMsg] = useState("");
  const [myArticles, setMyArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (address) setMyArticles(loadMyArticles(address));
  }, [address]);

  const handlePublish = () => {
    if (!title || !content || !price || !address) return;
    setMsg("");

    const id = generateId();
    const article: Article = {
      id,
      articleId: ("0x" + id.padEnd(64, "0").slice(0, 64)) as `0x${string}`,
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

    saveArticle(article);
    setMyArticles(loadMyArticles(address));
    setMsg("Yazi yayinlandi!");
    setTitle(""); setExcerpt(""); setContent(""); setPrice("1");
  };

  if (!isConnected) {
    return (
      <div className="main" style={{ paddingTop: "3rem", textAlign: "center" }}>
        <div style={{ fontFamily: "system-ui", color: "var(--text-muted)", fontSize: ".9rem" }}>
          Dashboard a erisim icin cuzdanini bagla.
        </div>
      </div>
    );
  }

  return (
    <div className="main" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div className="section-label" style={{ marginBottom: "1.5rem" }}>Yazar dashboard u</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Yayinlanan yazi", value: myArticles.length.toString() },
          { label: "Toplam okuma", value: myArticles.reduce((a, b) => a + b.readCount, 0).toString() },
          { label: "Cuzdan", value: address?.slice(0, 6) + "..." + address?.slice(-4) },
        ].map((s) => (
          <div key={s.label} style={{ border: "1px solid var(--border)", padding: "1rem 1.2rem" }}>
            <div style={{ fontFamily: "system-ui", fontSize: ".68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".3rem" }}>{s.label}</div>
            <div style={{ fontFamily: "Lora, Georgia, serif", fontSize: "1.1rem", fontWeight: 600, color: "var(--text)" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="col-label" style={{ marginBottom: "1.2rem" }}>Yeni yazi yayinla</div>
      <div style={{ border: "1px solid var(--border)", padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label className="form-label">Baslik</label>
            <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Yazi basligi" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem" }}>
            <div>
              <label className="form-label">Fiyat (USDC)</label>
              <input
                className="form-input"
                type="number"
                min="0.1"
                step="0.1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="orn: 2"
              />
            </div>
            <div>
              <label className="form-label">Kategori</label>
              <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {["DeFi", "AI x Web3", "Protokol", "NFT", "Rehber", "Gorus", "Teknik"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label className="form-label">Ozet</label>
          <textarea className="form-input" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Kisa aciklama (ana sayfada gorunur)" />
        </div>
        <div style={{ marginBottom: "1.2rem" }}>
          <label className="form-label">Icerik</label>
          <textarea className="form-input" rows={10} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Yazi icerigi — sadece odeme yapanlar gorecek" />
        </div>
        {msg && (
          <div style={{ fontFamily: "system-ui", fontSize: ".78rem", color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: ".6rem", marginBottom: "1rem" }}>
            {msg}
          </div>
        )}
        <button
          className="btn-write"
          style={{ padding: ".5rem 1.5rem", cursor: "pointer", opacity: (!title || !content) ? 0.5 : 1 }}
          onClick={handlePublish}
          disabled={!title || !content}
        >
          Yayinla
        </button>
      </div>

      <div className="col-label" style={{ marginBottom: "1rem" }}>Yazılarım</div>
      {myArticles.length === 0 ? (
        <div style={{ fontFamily: "system-ui", fontSize: ".85rem", color: "var(--text-muted)" }}>Henuz yazi yok.</div>
      ) : (
        myArticles.map((a) => (
          <div key={a.id} className="list-item">
            <div style={{ flex: 1 }}>
              <div className="list-title">{a.title}</div>
              <div className="list-meta-txt">{a.category} · {a.readCount} okuma · {usdcToHuman(a.priceUsdc)} USDC</div>
            </div>
            <div className="list-price">{usdcToHuman(a.priceUsdc)} USDC</div>
          </div>
        ))
      )}
    </div>
  );
}
