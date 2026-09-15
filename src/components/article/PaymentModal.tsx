"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ERC20_ABI } from "@/lib/abis";
import { USDC_ADDRESS, TREASURY_ADDRESS } from "@/lib/web3";
import type { Article } from "@/types";

type Step = "idle" | "approving" | "paying" | "confirming" | "verifying" | "success" | "error";

interface Props {
  article: Article;
  onSuccess: (content: string) => void;
  onClose: () => void;
}

function usdcToHuman(val: bigint | string): string {
  const n = typeof val === "bigint" ? val : BigInt(String(val));
  const human = Number(n) / 1_000_000;
  return human.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 6 });
}

export function PaymentModal({ article, onSuccess, onClose }: Props) {
  const { address } = useAccount();
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");
  const [payTxHash, setPayTxHash] = useState<`0x${string}` | undefined>();
  const [grantCalled, setGrantCalled] = useState(false);

  const { writeContractAsync } = useWriteContract();
  const priceUsdc = BigInt(String(article.priceUsdc));
  const priceHuman = usdcToHuman(priceUsdc);

  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: payTxHash,
    query: { enabled: !!payTxHash },
  });

  useEffect(() => {
    if (txConfirmed && payTxHash && !grantCalled) {
      setGrantCalled(true);
      grantAndFetch(payTxHash);
    }
  }, [txConfirmed, payTxHash, grantCalled]);

  async function grantAndFetch(txHash: `0x${string}`) {
    setStep("verifying");
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: article.articleId,
          address,
          txHash,
          priceUsdc: String(article.priceUsdc),
          authorAddress: article.author,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Access grant failed");

      const contentRes = await fetch(
        `/api/content?articleId=${article.articleId}&address=${address}&id=${article.id}`
      );
      const contentData = await contentRes.json();
      if (contentData.error) throw new Error(contentData.error);

      setStep("success");
      setTimeout(() => onSuccess(contentData.content || ""), 800);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Verification failed");
      setStep("error");
    }
  }

  const handlePay = async () => {
    if (!address) return;
    setError("");
    setGrantCalled(false);

    try {
      setStep("approving");
      await writeContractAsync({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [TREASURY_ADDRESS, priceUsdc],
      });

      setStep("paying");
      const hash = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [TREASURY_ADDRESS, priceUsdc],
      });
      setPayTxHash(hash);
      setStep("confirming");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed";
      setError(msg.includes("User rejected") ? "Transaction rejected." : msg);
      setStep("error");
    }
  };

  const stepLabels: Record<Step, string> = {
    idle: `READ — ${priceHuman} USDC`,
    approving: "STEP 1/2: APPROVE IN WALLET...",
    paying: "STEP 2/2: CONFIRM PAYMENT...",
    confirming: "WAITING FOR CONFIRMATION...",
    verifying: "UNLOCKING CONTENT...",
    success: "ACCESS GRANTED ✓",
    error: "TRY AGAIN",
  };

  const stepHints: Partial<Record<Step, string>> = {
    approving: "Please approve USDC spending in your wallet.",
    paying: "Please confirm the USDC transfer in your wallet.",
    confirming: "Transaction submitted, waiting for Base Sepolia confirmation...",
    verifying: "Verifying payment and unlocking article...",
  };

  return (
    <div className="overlay open" onClick={(e) => {
      if (e.target === e.currentTarget && step === "idle") onClose();
    }}>
      <div className="modal">
        <button className="modal-close" onClick={onClose} disabled={["approving","paying","confirming","verifying"].includes(step)}>✕</button>
        <div className="modal-tag">{article.category}</div>
        <div className="modal-title">{article.title}</div>
        <div className="modal-author">By {article.authorAlias}</div>
        <div className="modal-preview">{article.excerpt}</div>
        <div className="modal-x402">
          <span>x402 · Base Sepolia · USDC</span>
          <span className="x402-label">{priceHuman} USDC</span>
        </div>
        {stepHints[step] && (
          <div style={{ fontFamily: "var(--font-body)", fontSize: ".78rem", color: "var(--muted)", marginBottom: "1rem", padding: ".6rem .8rem", background: "var(--gray)", border: "1px solid var(--gray-2)" }}>
            {stepHints[step]}
          </div>
        )}
        {error && <div className="modal-error">{error}</div>}
        {!address ? (
          <div className="modal-warn">Connect your wallet to continue.</div>
        ) : (
          <div className="modal-actions">
            <button
              className="btn-pay"
              onClick={step === "error" ? () => { setStep("idle"); setError(""); setGrantCalled(false); } : handlePay}
              disabled={["approving","paying","confirming","verifying","success"].includes(step)}
              style={{ background: step === "success" ? "#166534" : step === "error" ? "#991b1b" : "var(--badge)" }}
            >
              {stepLabels[step]}
            </button>
            <button className="btn-cancel" onClick={onClose} disabled={["approving","paying","confirming","verifying"].includes(step)}>CLOSE</button>
          </div>
        )}
      </div>
    </div>
  );
}
