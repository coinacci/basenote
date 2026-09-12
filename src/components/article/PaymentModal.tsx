"use client";

import { useX402Payment, usdcToHuman } from "@/hooks/useX402Payment";
import { useAccount } from "wagmi";
import type { Article } from "@/types";

interface Props {
  article: Article;
  onSuccess: () => void;
  onClose: () => void;
}

export function PaymentModal({ article, onSuccess, onClose }: Props) {
  const { address } = useAccount();
  const { pay, status, error, reset } = useX402Payment();

  const priceHuman = usdcToHuman(article.priceUsdc);

  const handlePay = async () => {
    const ok = await pay(article.articleId, article.priceUsdc);
    if (ok) onSuccess();
  };

  const statusLabel = {
    idle: `Oku — ${priceHuman} USDC`,
    approving: "USDC onaylanıyor…",
    purchasing: "İşlem gönderiliyor…",
    success: "Ödendi ✓",
    error: "Tekrar dene",
  }[status];

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-tag">{article.category}</div>
        <div className="modal-title">{article.title}</div>
        <div className="modal-author">Yazar: {article.authorAlias}</div>
        <div className="modal-preview">{article.excerpt}</div>

        <div className="modal-x402">
          <span>x402 — Base ağı — USDC</span>
          <span className="x402-label">{priceHuman} USDC</span>
        </div>

        {error && (
          <div className="modal-error">{error}</div>
        )}

        {!address ? (
          <div className="modal-warn">Önce cüzdanını bağla.</div>
        ) : (
          <div className="modal-actions">
            <button
              className="btn-pay"
              onClick={status === "error" ? reset : handlePay}
              disabled={status === "approving" || status === "purchasing" || status === "success"}
              style={{
                background: status === "success" ? "#166534" :
                            status === "error" ? "#991b1b" : "#0052FF",
              }}
            >
              {statusLabel}
            </button>
            <button className="btn-cancel" onClick={onClose}>Kapat</button>
          </div>
        )}
      </div>
    </div>
  );
}
