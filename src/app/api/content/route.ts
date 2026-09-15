import { NextRequest, NextResponse } from "next/server";
import { redis, accessKey, checkAndRecordPayment } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const articleId = req.nextUrl.searchParams.get("articleId");
  const address = req.nextUrl.searchParams.get("address");
  const id = req.nextUrl.searchParams.get("id");

  if (!articleId || !address || !id) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  // Erişim kontrolü
  const key = accessKey(articleId, address);
  const hasAccess = await redis.get(key);

  if (!hasAccess) {
    return NextResponse.json({ error: "No access" }, { status: 403 });
  }

  const content = await redis.get(`article-content:${id}`);
  if (!content) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  return NextResponse.json({ content });
}
