import { NextRequest, NextResponse } from "next/server";
import { redis, accessKey, checkAndRecordPayment } from "@/lib/redis";

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
  const txUsed = await redis.get(`tx:${txHash}`);
  if (txUsed) {
    // Zaten erişimi var, içeriği dön
    return NextResponse.json({ success: true, alreadyPaid: true });
  }

  await checkAndRecordPayment(articleId, address, priceUsdc, txHash);
  return NextResponse.json({ success: true });
}
