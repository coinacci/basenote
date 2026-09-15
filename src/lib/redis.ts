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
  txHash: string
): Promise<boolean> {
  const key = accessKey(articleId, address);
  const existing = await redis.get(key);
  if (existing) return true; // zaten erişimi var

  // Erişim kaydet — kalıcı
  await redis.set(key, {
    txHash,
    priceUsdc,
    grantedAt: Date.now(),
  });

  // TX'i kullanılmış işaretle
  await redis.set(`tx:${txHash}`, { articleId, address }, { ex: 60 * 60 * 24 * 365 });

  // Okuma sayacı artır
  await redis.incr(`reads:${articleId}`);

  // Günlük satış takibi
  const today = new Date().toISOString().slice(0, 10);
  await redis.incr(`sales:${today}`);

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
