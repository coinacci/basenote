export interface Article {
  id: string;           // UUID — frontend
  articleId: `0x${string}`; // bytes32 — contract
  title: string;
  excerpt: string;
  content?: string;     // sadece satın alındıktan sonra dolu
  author: `0x${string}`;
  authorAlias: string;  // ENS veya kısaltılmış adres
  priceUsdc: bigint;    // USDC wei (6 decimal)
  readCount: number;
  category: string;
  publishedAt: number;  // unix timestamp
  purchased?: boolean;
}

export interface AuthorStats {
  address: `0x${string}`;
  alias: string;
  totalEarned: bigint;
  readCount: bigint;
  articleCount: number;
}

export interface TreasuryInfo {
  balance: bigint;
  nextDistributionAt: bigint;
  platformBps: number;
  authorBps: number;
  readerBps: number;
}

export type PaymentStatus =
  | "idle"
  | "approving"
  | "purchasing"
  | "success"
  | "error";
