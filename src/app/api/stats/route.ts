import { NextResponse } from "next/server";
import { getAllSales } from "@/lib/redis";

export async function GET() {
  const sales = await getAllSales();
  const total = sales.reduce((sum, s) => sum + s.count, 0);
  return NextResponse.json({ sales, total });
}
