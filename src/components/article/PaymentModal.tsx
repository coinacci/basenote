"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ERC20_ABI } from "@/lib/abis";
import { USDC_ADDRESS, TREASURY_ADDRESS } from "@/lib/web3";
import type { Article } from "@/types";

type Step = "idle" | "approving" | "paying" | "verifying" | "success" | "error";

interface Props {
  article: Article;
  onSuccess: (content: string) => void;
  onClose: () => void;
}

function usdcToHuman(val: bigint | string): string {
  const n = typeof val === "bigint" ? val : BigInt(val);
  const human = Number(n) / 1_000_000;
  return human % 1 === 0 ? human.toFixed(0) : human.toFixed(2);
}

export function PaymentModal({ article, onSuccess, onClose }: Props) {
  const { address } = useAccount();
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");
  const [approveTxHash, setApproveTxHash] = useState<`0x${string}` | undefined>();
  const [payTxHash, setPayTxHash] = useState<`0x${string}` | undefined>();

  const { writeContractAsync } = useWriteContract();

  const priceUsdc = BigInt(article.priceUsdc);
  const priceHuman = usdcToHuman(priceUsdc);

  // Approve tx confirm
  const { isSuccess: approveConfirmed } = useWaitForTransactionReceipt({
    hash: approveTxHash,
    query: { enabled: !!approveTxHash },
  });

  // Pay tx confirm
  const { isSuccess: payConfirmed } = useWaitForTransactionReceipt({
    hash: payTxHash,
    query: { enabled: !!payTxHash },
  });

  useEffect(() => {
    if (approveConfirmed && step === "approving") {
      sendPayment();
    }
  }, [approveConfirmed]);

  useEffect(() => {
    if (payConfirmed && payTxHash && step === "paying") {
      grantAccess(payTxHash);
    }
  }, [payConfirmed, payTxHash]);

  const handlePay = async () => {
    if (!address) return;
    setError("");
    setStep("approving");
    try {
      const hash = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [TREASURY_ADDRESS, priceUsdc],
      });
      setApproveTxHash(hash);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed";
      setError(msg.includes("User rejected") ? "Transaction rejected." : "Approval failed.");
      setStep("error");
    }
  };

  const sendPayment = async () => {
    setStep("paying");
    try {
      const hash = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [TREASURY_ADDRESS, priceUsdc],
      });
      setPayTxHash(hash);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed";
      setError(msg.includes("User rejected") ? "Transaction rejected." : "Payment failed.");
      setStep("error");
    }
  };

  const grantAccess = async (txHash: `0x${string}`) => {
    setStep("verifying");
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: article.articleId,
          address,
          txHash,
          priceUsdc: article.priceUsdc.toString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        // İçeriği çek
        const contentRes = await fetch(
          `/api/articles/content?articleId=${article.articleId}&address=${address}&id=${article.id}`
        );
        const contentData = await contentRes.json();
        setStep("success");
        setTimeout(() => onSuccess(contentData.content || ""), 800);
      } else {
        setError(data.error || "Verification failed.");
        setStep("error");
      }
    } catch {
      setError("Network error.");
      setStep("error");
    }
  };

  const label = {
    idle: `READ — ${priceHuman} USDC`,
    approving: "STEP 1/2: APPROVING USDC...",
    paying: "STEP 2/2: SENDING PAYMENT...",
    verifying: "VERIFYING ON-CHAIN...",
    success: "ACCESS GRANTED ✓",
    error: "TRY AGAIN",
  }[step];

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && step === "idle" && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose} disabled={["approving","paying","verifying"].includes(step)}>✕</button>
        <div className="modal-tag">{article.category}</div>
        <div className="modal-title">{article.title}</div>
        <div className="modal-author">By {article.authorAlias}</div>
        <div className="modal-preview">{article.excerpt}</div>
        <div className="modal-x402">
          <span>x402 · Base Sepolia · USDC</span>
          <span className="x402-label">{priceHuman} USDC</span>
        </div>

        {step !== "idle" && step !== "error" && step !== "success" && (
          <div style={{ fontFamily: "var(--font-body)", fontSize: ".78rem", color: "var(--muted)", marginBottom: "1rem", padding: ".6rem", background: "var(--gray)", border: "1px solid var(--gray-2)" }}>
            {step === "approving" && "Please confirm the approval in your wallet..."}
            {step === "paying" && "Please confirm the payment in your wallet..."}
            {step === "verifying" && "Confirming transaction on Base Sepolia..."}
          </div>
        )}

        {error && (
          <div className="modal-error">{error}</div>
        )}

        {!address ? (
          <div className="modal-warn">Connect your wallet to continue.</div>
        ) : (
          <div className="modal-actions">
            <button
              className="btn-pay"
              onClick={step === "error" ? () => { setStep("idle"); setError(""); } : handlePay}
              disabled={["approving", "paying", "verifying", "success"].includes(step)}
              style={{
                background: step === "success" ? "#166534" :
                            step === "error" ? "#991b1b" :
                            "var(--badge)",
              }}
            >
              {label}
            </button>
            <button
              className="btn-cancel"
              onClick={onClose}
              disabled={["approving", "paying", "verifying"].includes(step)}
            >
              CLOSE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
