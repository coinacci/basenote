import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import type { Article } from "@/types";

export async function GET() {
  try {
    const keys = await redis.keys("article:*");
    if (!keys.length) return NextResponse.json({ articles: [] });

    const articles = await Promise.all(
      keys.map(async (key) => {
        const a = await redis.get(key);
        return a as Article;
      })
    );

    const sorted = articles
      .filter(Boolean)
      .sort((a, b) => b.publishedAt - a.publishedAt);

    return NextResponse.json({ articles: sorted });
  } catch (e) {
    return NextResponse.json({ articles: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const article: Article = await req.json();
    if (!article.id || !article.title || !article.author) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    // content'i ayrı saklıyoruz — sadece erişimi olanlar görecek
    const { content, ...meta } = article;
    await redis.set(`article:${article.id}`, meta);
    await redis.set(`article-content:${article.id}`, content || "");
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
