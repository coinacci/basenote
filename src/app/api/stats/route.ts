import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    const keys = await redis.keys("sales:*");
    if (!keys.length) return NextResponse.json({ sales: [], total: 0 });

    const entries = await Promise.all(
      keys.map(async (key) => ({
        date: key.replace("sales:", ""),
        count: Number(await redis.get(key)),
      }))
    );

    const sorted = entries.sort((a, b) => b.date.localeCompare(a.date));
    const total = sorted.reduce((sum, s) => sum + s.count, 0);

    return NextResponse.json({ sales: sorted, total });
  } catch {
    return NextResponse.json({ sales: [], total: 0 });
  }
}
