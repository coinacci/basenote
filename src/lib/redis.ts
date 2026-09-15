import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export function accessKey(articleId: string, address: string) {
  return `access:${articleId}:${address.toLowerCase()}`;
}

export async function checkAndRecordPayment(
  articleId: string,
  address: string,
  priceUsdc: string,
  txHash: string,
  authorAddress: string
): Promise<boolean> {
  const key = accessKey(articleId, address);
  const existing = await redis.get(key);
  if (existing) return true;

  const price = parseFloat(priceUsdc) / 1_000_000;

  // Erişim kaydet
  await redis.set(key, { txHash, priceUsdc, grantedAt: Date.now() });

  // TX kullanılmış işaretle
  await redis.set(`tx:${txHash}`, { articleId, address }, { ex: 60 * 60 * 24 * 365 });

  // Okuma sayacı
  await redis.incr(`reads:${articleId}`);

  // Günlük satış
  const today = new Date().toISOString().slice(0, 10);
  await redis.incr(`sales:${today}`);

  // Yazar kazancı — bu dönem
  await redis.incrbyfloat(`author-earnings:${authorAddress.toLowerCase()}`, price);

  // Okuyucu harcaması — bu dönem
  await redis.incrbyfloat(`reader-spending:${address.toLowerCase()}`, price);

  // Toplam yazar kazancı tracker
  await redis.incrbyfloat(`total-author-earnings`, price);

  // Toplam okuyucu harcaması tracker
  await redis.incrbyfloat(`total-reader-spending`, price);

  return false;
}

export async function getAllSales() {
  const keys = await redis.keys("sales:*");
  if (!keys.length) return [];
  const entries = await Promise.all(
    keys.map(async (key) => ({
      date: key.replace("sales:", ""),
      count: Number(await redis.get(key)),
    }))
  );
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getDistributionData(treasuryBalance: number) {
  const authorPool = +(treasuryBalance * 0.70).toFixed(2);
  const readerPool = +(treasuryBalance * 0.15).toFixed(2);

  const totalAuthorEarnings = parseFloat((await redis.get("total-author-earnings") as string) || "0");
  const totalReaderSpending = parseFloat((await redis.get("total-reader-spending") as string) || "0");

  // Yazar listesi
  const authorKeys = await redis.keys("author-earnings:*");
  const authors = await Promise.all(
    authorKeys.map(async (key) => {
      const address = key.replace("author-earnings:", "");
      const earned = parseFloat((await redis.get(key) as string) || "0");
      const share = totalAuthorEarnings > 0 ? +(earned / totalAuthorEarnings * authorPool).toFixed(2) : 0;
      return { address, earned: +earned.toFixed(2), share };
    })
  );

  // Okuyucu listesi
  const readerKeys = await redis.keys("reader-spending:*");
  const readers = await Promise.all(
    readerKeys.map(async (key) => {
      const address = key.replace("reader-spending:", "");
      const spent = parseFloat((await redis.get(key) as string) || "0");
      const share = totalReaderSpending > 0 ? +(spent / totalReaderSpending * readerPool).toFixed(2) : 0;
      return { address, spent: +spent.toFixed(2), share };
    })
  );

  return {
    authors: authors.sort((a, b) => b.share - a.share),
    readers: readers.sort((a, b) => b.share - a.share),
    totalAuthorEarnings: +totalAuthorEarnings.toFixed(2),
    totalReaderSpending: +totalReaderSpending.toFixed(2),
  };
}
