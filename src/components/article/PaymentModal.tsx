"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { ERC20_ABI } from "@/lib/abis";
import { USDC_ADDRESS, TREASURY_ADDRESS } from "@/lib/web3";
import { usdcToHuman } from "@/hooks/useX402Payment";
import type { Article } from "@/types";

type Step = "idle" | "approving" | "approved" | "paying" | "verifying" | "success" | "error";

interface Props {
  article: Article;
  onSuccess: () => void;
  onClose: () => void;
}

export function PaymentModal({ article, onSuccess, onClose }: Props) {
  const { address } = useAccount();
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { writeContractAsync } = useWriteContract();

  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  });

  useEffect(() => {
    if (txConfirmed && txHash && step === "paying") {
      grantAccess(txHash);
    }
  }, [txConfirmed, txHash]);

  const grantAccess = async (hash: `0x${string}`) => {
    setStep("verifying");
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: article.articleId,
          address,
          txHash: hash,
          priceUsdc: article.priceUsdc.toString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("success");
        setTimeout(onSuccess, 1000);
      } else {
        setError(data.error || "Verification failed");
        setStep("error");
      }
    } catch {
      setError("Network error");
      setStep("error");
    }
  };

  const handlePay = async () => {
    if (!address) return;
    setError("");
    try {
      // 1. Approve
      setStep("approving");
      await writeContractAsync({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [TREASURY_ADDRESS, article.priceUsdc],
      });

      // 2. Transfer USDC to treasury
      setStep("paying");
      const hash = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [TREASURY_ADDRESS, article.priceUsdc],
      });
      setTxHash(hash);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      setError(msg.includes("User rejected") ? "Transaction rejected" : msg);
      setStep("error");
    }
  };

  const priceHuman = usdcToHuman(article.priceUsdc);

  const label = {
    idle: `READ — ${priceHuman} USDC`,
    approving: "APPROVING USDC...",
    approved: "APPROVED",
    paying: "SENDING PAYMENT...",
    verifying: "VERIFYING...",
    success: "ACCESS GRANTED ✓",
    error: "TRY AGAIN",
  }[step];

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-tag">{article.category}</div>
        <div className="modal-title">{article.title}</div>
        <div className="modal-author">By {article.authorAlias}</div>
        <div className="modal-preview">{article.excerpt}</div>
        <div className="modal-x402">
          <span>x402 — Base network — USDC</span>
          <span className="x402-label">{priceHuman} USDC</span>
        </div>
        {error && <div className="modal-error">{error}</div>}
        {!address ? (
          <div className="modal-warn">Connect your wallet to continue.</div>
        ) : (
          <div className="modal-actions">
            <button
              className="btn-pay"
              onClick={step === "error" ? () => setStep("idle") : handlePay}
              disabled={["approving", "paying", "verifying", "success"].includes(step)}
              style={{
                background: step === "success" ? "#166534" :
                            step === "error" ? "#991b1b" : "var(--crimson)",
              }}
            >
              {label}
            </button>
            <button className="btn-cancel" onClick={onClose}>CLOSE</button>
          </div>
        )}
      </div>
    </div>
  );
}
