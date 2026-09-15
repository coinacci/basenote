export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { createX402ServerInstance, x402Config } from "@/lib/x402";
import { redis, checkAndRecordPayment, accessKey } from "@/lib/redis";

const x402Server = createX402ServerInstance();

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const address = req.headers.get("x-payment-address") || "";
  const txHash = req.headers.get("x-payment-transaction") || "";
  const articleId = req.nextUrl.searchParams.get("articleId") || id;
  const priceUsdc = req.nextUrl.searchParams.get("price") || "0";

  // Erişim kontrol et veya kaydet
  const alreadyHad = await checkAndRecordPayment(articleId, address, priceUsdc, txHash);

  // İçeriği getir
  const content = await redis.get(`article-content:${id}`);

  if (!content) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json({ content, alreadyHad });
}

export const GET = withX402(handler, x402Server, {
  scheme: "exact",
  price: "$0.01", // x402 minimum — gerçek fiyat article'dan gelecek
  network: x402Config.network,
  payTo: x402Config.payTo,
});
