"use client";

import { useState, useCallback } from "react";
import { useWriteContract, useReadContract, useAccount } from "wagmi";
import { parseUnits } from "viem";
import { TREASURY_ABI, ERC20_ABI } from "@/lib/abis";
import { USDC_ADDRESS, TREASURY_ADDRESS } from "@/lib/web3";
import type { PaymentStatus } from "@/types";

export function usdcToHuman(val: bigint | string | number): string {
  const n = typeof val === "bigint" ? val : BigInt(String(val));
  const human = Number(n) / 1_000_000;
  // Gereksiz trailing zero'ları kaldır: 4.25 → "4.25", 2.00 → "2", 4.50 → "4.5"
  return human.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
}

export function humanToUsdc(amount: number): bigint {
  return parseUnits(amount.toString(), 6);
}

export function useX402Payment() {
  const { address } = useAccount();
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, TREASURY_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  const pay = useCallback(
    async (articleId: `0x${string}`, priceUsdc: bigint): Promise<boolean> => {
      if (!address) { setError("Wallet not connected"); return false; }
      setError(null);
      try {
        const currentAllowance = allowance ?? 0n;
        if (currentAllowance < priceUsdc) {
          setStatus("approving");
          await writeContractAsync({
            address: USDC_ADDRESS,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [TREASURY_ADDRESS, priceUsdc],
          });
          await refetchAllowance();
        }
        setStatus("purchasing");
        await writeContractAsync({
          address: TREASURY_ADDRESS,
          abi: TREASURY_ABI,
          functionName: "purchaseArticle",
          args: [articleId],
        });
        setStatus("success");
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Payment failed";
        setError(msg.includes("User rejected") ? "Transaction rejected" : msg);
        setStatus("error");
        return false;
      }
    },
    [address, allowance, writeContractAsync, refetchAllowance]
  );

  const reset = useCallback(() => { setStatus("idle"); setError(null); }, []);

  return { pay, status, error, reset };
}
