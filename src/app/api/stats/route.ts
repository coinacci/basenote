import { NextResponse } from "next/server";
import { getAllSales, getDistributionData } from "@/lib/redis";
import { createPublicClient, http, formatUnits } from "viem";
import { base } from "viem/chains";

const USDC_MAINNET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`;
const TREASURY = process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS as `0x${string}`;

const ERC20_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
] as const;

export async function GET() {
  try {
    const sales = await getAllSales();
    const total = sales.reduce((sum, s) => sum + s.count, 0);

    const client = createPublicClient({ chain: base, transport: http("https://mainnet.base.org") });
    const balance = await client.readContract({
      address: USDC_MAINNET,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [TREASURY],
    });
    const balanceUsdc = parseFloat(formatUnits(balance, 6));

    const distribution = await getDistributionData(balanceUsdc);

    return NextResponse.json({ sales, total, balance: balanceUsdc, distribution });
  } catch (e) {
    console.error("Stats error:", e);
    return NextResponse.json({ sales: [], total: 0, balance: 0, distribution: { authors: [], readers: [], totalAuthorEarnings: 0, totalReaderSpending: 0 } });
  }
}
