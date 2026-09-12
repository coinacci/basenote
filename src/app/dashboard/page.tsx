"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { TREASURY_ABI } from "@/lib/abis";
import { TREASURY_ADDRESS } from "@/lib/web3";
import { useAuthorStats } from "@/hooks/useTreasury";
import { usdcToHuman, humanToUsdc } from "@/hooks/useX402Payment";
import { toArticleId, MOCK_ARTICLES } from "@/lib/articles";
import { v4 as uuidv4 } from "uuid";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { totalEarnedHuman, readCount } = useAuthorStats(address);
  const { writeContractAsync } = useWriteContract();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("1");
  const [category, setCategory] = useState("DeFi");
  const [publishing, setPublishing] = useState(false);
  const [txMsg, setTxMsg] = useState("");

  const myArticles = MOCK_ARTICLES.filter(
    (a) => a.author.toLowerCase() === address?.toLowerCase()
  );

  const handlePublish = async () => {
    if (!title || !content || !price) return;
    setPublishing(true);
    setTxMsg("");
    try {
      const uuid = uuidv4();
      const articleId = toArticleId(uuid);
      const priceWei = humanToUsdc(parseFloat(price));

      await writeContractAsync({
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: "publishArticle",
        args: [articleId, priceWei],
      });

      setTxMsg("✓ Yazı on-chain yayınlandı! UUID: " + uuid);
      setTitle(""); setExcerpt(""); setContent(""); setPrice("1");
    } catch (e: unknown) {
      setTxMsg("Hata: " + (e instanceof Error ? e.message : "Bilinmeyen hata"));
    } finally {
      setPublishing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="main" style={{ paddingTop: "3rem", textAlign: "center" }}>
        <div style={{ fontFamily: "system-ui", color: "#555", fontSize: ".9rem" }}>
          Dashboard'a erişmek için cüzdanını bağla.
        </div>
      </div>
    );
  }

  return (
    <div className="main" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      {/* Kazanç özeti */}
      <div className="section-label" style={{ marginBottom: "1.5rem" }}>Yazar dashboard'u</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Toplam kazanç", value: totalEarnedHuman + " USDC" },
          { label: "Toplam okuma", value: readCount.toString() },
          { label: "Yayınlanan yazı", value: myArticles.length.toString() },
        ].map((s) => (
          <div key={s.label} style={{ border: "1px solid #e5e5e5", padding: "1rem 1.2rem" }}>
            <div style={{ fontFamily: "system-ui", fontSize: ".68rem", color: "#888", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".3rem" }}>{s.label}</div>
            <div style={{ fontFamily: "Lora, Georgia, serif", fontSize: "1.3rem", fontWeight: 600 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Yazı yayınlama formu */}
      <div className="col-label" style={{ marginBottom: "1.2rem" }}>Yeni yazı yayınla</div>
      <div style={{ border: "1px solid #e5e5e5", padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label className="form-label">Başlık</label>
            <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Yazı başlığı" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem" }}>
            <div>
              <label className="form-label">Fiyat (USDC)</label>
              <input className="form-input" type="number" min="0.1" step="0.1" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Kategori</label>
              <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {["DeFi", "AI × Web3", "Protokol", "NFT", "Rehber", "Görüş", "Teknik"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label className="form-label">Özet</label>
          <textarea className="form-input" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Kısa açıklama (ana sayfada görünür)" />
        </div>
        <div style={{ marginBottom: "1.2rem" }}>
          <label className="form-label">İçerik</label>
          <textarea className="form-input" rows={8} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Yazı içeriği (sadece ödeme yapanlar görecek)" />
        </div>
        {txMsg && (
          <div style={{ fontFamily: "system-ui", fontSize: ".78rem", color: txMsg.startsWith("✓") ? "#166534" : "#991b1b", marginBottom: "1rem", padding: ".6rem", background: txMsg.startsWith("✓") ? "#f0fdf4" : "#fef2f2", border: `1px solid ${txMsg.startsWith("✓") ? "#bbf7d0" : "#fecaca"}` }}>
            {txMsg}
          </div>
        )}
        <button
          className="btn-write"
          style={{ padding: ".5rem 1.5rem", cursor: "pointer" }}
          onClick={handlePublish}
          disabled={publishing || !title || !content}
        >
          {publishing ? "Yayınlanıyor…" : "On-chain yayınla"}
        </button>
      </div>

      {/* Yazı listesi */}
      <div className="col-label" style={{ marginBottom: "1rem" }}>Yazılarım</div>
      {myArticles.length === 0 ? (
        <div style={{ fontFamily: "system-ui", fontSize: ".85rem", color: "#888" }}>Henüz yazı yok.</div>
      ) : (
        myArticles.map((a) => (
          <div key={a.id} className="list-item">
            <div style={{ flex: 1 }}>
              <div className="list-title">{a.title}</div>
              <div className="list-meta-txt">{a.readCount} okuma · {usdcToHuman(a.priceUsdc)} USDC</div>
            </div>
            <div className="list-price">{usdcToHuman(a.priceUsdc)} USDC</div>
          </div>
        ))
      )}
    </div>
  );
}
