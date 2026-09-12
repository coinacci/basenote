import { keccak256, toHex } from "viem";
import type { Article } from "@/types";

/** UUID'den bytes32 articleId üret */
export function toArticleId(uuid: string): `0x${string}` {
  return keccak256(toHex(uuid));
}

/** USDC miktarını wei'ye çevir (6 decimal) */
export function usdcWei(amount: number): bigint {
  return BigInt(Math.round(amount * 1_000_000));
}

// Geçici mock veri — ileride Supabase/Postgres ile değiştirilir
export const MOCK_ARTICLES: Article[] = [
  {
    id: "a1b2c3d4-0001",
    articleId: toArticleId("a1b2c3d4-0001"),
    title: "Base ekosisteminde likidite katmanları: Dört protokolün karşılaştırması",
    excerpt:
      "Base üzerinde aktif olan dört DeFi protokolünü — Aerodrome, Morpho, Moonwell ve Seamless — likidite derinliği, fee yapısı ve risk modeli açısından karşılaştırıyoruz.",
    content:
      "Bu yazı satın alındıktan sonra görünür. Gerçek içerik buraya gelecek.",
    author: "0x4a2b000000000000000000000000000000000001",
    authorAlias: "coinacci.base.eth",
    priceUsdc: usdcWei(2),
    readCount: 847,
    category: "DeFi",
    publishedAt: 1725926400,
  },
  {
    id: "a1b2c3d4-0002",
    articleId: toArticleId("a1b2c3d4-0002"),
    title: "AI ajanları on-chain nasıl para kazanır",
    excerpt:
      "Otonom AI ajanları artık kendi adına işlem yapabiliyor. x402 protokolü bu denklemi tamamen değiştiriyor.",
    content: "Tam içerik satın alındıktan sonra açılır.",
    author: "0x4a2b000000000000000000000000000000000002",
    authorAlias: "aibuilder.eth",
    priceUsdc: usdcWei(1),
    readCount: 612,
    category: "AI × Web3",
    publishedAt: 1725840000,
  },
  {
    id: "a1b2c3d4-0003",
    articleId: toArticleId("a1b2c3d4-0003"),
    title: "x402: HTTP'nin unutulan ödeme katmanı",
    excerpt:
      "HTTP 402 durum kodu yıllardır 'Payment Required' olarak tanımlanmış ama hiç implement edilmemişti. x402 bunu değiştiriyor.",
    content: "Tam içerik satın alındıktan sonra açılır.",
    author: "0x4a2b000000000000000000000000000000000003",
    authorAlias: "protocol.eth",
    priceUsdc: usdcWei(1.5),
    readCount: 389,
    category: "Protokol",
    publishedAt: 1725753600,
  },
  {
    id: "a1b2c3d4-0004",
    articleId: toArticleId("a1b2c3d4-0004"),
    title: "NFT sanatçısı olarak gelir modelleri",
    excerpt:
      "Dijital sanat piyasasının aldığı yeni şekil, yaratıcılar için farklı gelir kapıları açıyor. Royalty modellerinin çöküşü ve alternatif yollar.",
    content: "Tam içerik satın alındıktan sonra açılır.",
    author: "0x4a2b000000000000000000000000000000000004",
    authorAlias: "artblock.eth",
    priceUsdc: usdcWei(3),
    readCount: 431,
    category: "NFT",
    publishedAt: 1725667200,
  },
  {
    id: "a1b2c3d4-0005",
    articleId: toArticleId("a1b2c3d4-0005"),
    title: "Onchain yazarlık ekonomisi nereye gidiyor",
    excerpt:
      "Fiat ödeme sistemleri içerik üreticilerini neden çökertir, ve alternatif neden Base üzerinde şekilleniyor.",
    content: "Tam içerik satın alındıktan sonra açılır.",
    author: "0x4a2b000000000000000000000000000000000005",
    authorAlias: "writer.eth",
    priceUsdc: usdcWei(1),
    readCount: 389,
    category: "Görüş",
    publishedAt: 1725580800,
  },
  {
    id: "a1b2c3d4-0006",
    articleId: toArticleId("a1b2c3d4-0006"),
    title: "USDC ile mikro ödeme: teknik entegrasyon rehberi",
    excerpt:
      "x402 protokolü üzerinde USDC ödemesi nasıl kurulur, kod örnekleriyle adım adım.",
    content: "Tam içerik satın alındıktan sonra açılır.",
    author: "0x4a2b000000000000000000000000000000000006",
    authorAlias: "defidev.eth",
    priceUsdc: usdcWei(2),
    readCount: 287,
    category: "DeFi",
    publishedAt: 1725494400,
  },
];
