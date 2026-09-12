"use client";

import { useReadContract } from "wagmi";
import { TREASURY_ABI } from "@/lib/abis";
import { TREASURY_ADDRESS } from "@/lib/web3";
import { usdcToHuman } from "./useX402Payment";

export function useTreasury() {
  const { data: balance } = useReadContract({
    address: TREASURY_ADDRESS,
    abi: TREASURY_ABI,
    functionName: "treasuryBalance",
  });

  const { data: nextDistAt } = useReadContract({
    address: TREASURY_ADDRESS,
    abi: TREASURY_ABI,
    functionName: "nextDistributionAt",
  });

  const now = BigInt(Math.floor(Date.now() / 1000));
  const secondsLeft =
    nextDistAt && nextDistAt > now ? nextDistAt - now : 0n;

  const days = Number(secondsLeft / 86400n);
  const hours = Number((secondsLeft % 86400n) / 3600n);
  const minutes = Number((secondsLeft % 3600n) / 60n);

  return {
    balance: balance ?? 0n,
    balanceHuman: balance ? usdcToHuman(balance) : "0",
    nextDistributionAt: nextDistAt ?? 0n,
    countdown: { days, hours, minutes },
    countdownStr: `${days}g ${String(hours).padStart(2, "0")}s ${String(minutes).padStart(2, "0")}d`,
  };
}

export function useAuthorStats(address?: `0x${string}`) {
  const { data } = useReadContract({
    address: TREASURY_ADDRESS,
    abi: TREASURY_ABI,
    functionName: "getAuthorStats",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return {
    totalEarned: data?.[0] ?? 0n,
    totalEarnedHuman: data?.[0] ? usdcToHuman(data[0]) : "0",
    readCount: data?.[1] ?? 0n,
  };
}
