"use client";

import { useState, useCallback } from "react";
import { useWriteContract, useReadContract, useAccount } from "wagmi";
import { parseUnits } from "viem";
import { TREASURY_ABI, ERC20_ABI } from "@/lib/abis";
import { USDC_ADDRESS, TREASURY_ADDRESS } from "@/lib/web3";
import type { PaymentStatus } from "@/types";

/**
 * x402 ödeme akışı:
 * 1. USDC allowance kontrol et
 * 2. Yetersizse approve() çağır
 * 3. purchaseArticle() çağır
 * 4. İçeriği aç
 */
export function useX402Payment() {
  const { address } = useAccount();
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  // Mevcut allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, TREASURY_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  const pay = useCallback(
    async (articleId: `0x${string}`, priceUsdc: bigint): Promise<boolean> => {
      if (!address) {
        setError("Cüzdan bağlı değil");
        return false;
      }

      setError(null);

      try {
        // USDC 6 decimal — priceUsdc zaten wei cinsinden gelir
        const currentAllowance = allowance ?? 0n;

        // 1. Approve gerekiyorsa
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

        // 2. purchaseArticle
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
        const msg =
          err instanceof Error ? err.message : "Ödeme başarısız";
        setError(msg.includes("User rejected") ? "İşlem reddedildi" : msg);
        setStatus("error");
        return false;
      }
    },
    [address, allowance, writeContractAsync, refetchAllowance]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return { pay, status, error, reset };
}

/**
 * USDC fiyatını insan okunabilir formata çevirir
 * USDC 6 decimal kullanır
 */
export function usdcToHuman(wei: bigint): string {
  const human = Number(wei) / 1_000_000;
  return human % 1 === 0 ? human.toFixed(0) : human.toFixed(2);
}

export function humanToUsdc(amount: number): bigint {
  return parseUnits(amount.toString(), 6);
}
