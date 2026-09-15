import { NextRequest, NextResponse } from "next/server";
import { redis, accessKey } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const articleId = req.nextUrl.searchParams.get("articleId");
  const address = req.nextUrl.searchParams.get("address");

  if (!articleId || !address) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const key = accessKey(articleId, address);
  const hasAccess = await redis.get(key);

  return NextResponse.json({ hasAccess: !!hasAccess });
}

export async function POST(req: NextRequest) {
  const { articleId, address, txHash, priceUsdc } = await req.json();

  if (!articleId || !address || !txHash) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  // TX daha önce kullanılmış mı?
  const txKey = `tx:${txHash}`;
  const txUsed = await redis.get(txKey);
  if (txUsed) {
    return NextResponse.json({ error: "Transaction already used" }, { status: 400 });
  }

  // TODO: Base chain'de TX verify eklenecek
  // Şimdilik txHash varlığı yeterli

  // Access ver — 1 yıl geçerli
  const key = accessKey(articleId, address);
  await redis.set(key, { txHash, priceUsdc, grantedAt: Date.now() }, { ex: 60 * 60 * 24 * 365 });

  // TX'i kullanılmış olarak işaretle
  await redis.set(txKey, { articleId, address }, { ex: 60 * 60 * 24 * 365 });

  return NextResponse.json({ success: true });
}
