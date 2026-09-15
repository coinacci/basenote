import type { Article } from "@/types";

export function usdcWei(amount: number): bigint {
  return BigInt(Math.round(amount * 1_000_000));
}

export const MOCK_ARTICLES: Article[] = [];
