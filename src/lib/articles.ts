import { keccak256, toHex } from "viem";
import type { Article } from "@/types";

export function toArticleId(uuid: string): `0x${string}` {
  return keccak256(toHex(uuid));
}

export function usdcWei(amount: number): bigint {
  return BigInt(Math.round(amount * 1_000_000));
}

export const MOCK_ARTICLES: Article[] = [];
