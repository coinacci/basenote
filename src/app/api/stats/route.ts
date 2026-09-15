import { NextResponse } from "next/server";
import { redis, getAllSales, getDistributionData } from "@/lib/redis";
import { createPublicClient, http, formatUnits } from "viem";
import { baseSepolia } from "viem/chains";

const USDC_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`;
const TREASURY = process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS as `0x${string}`;

const ERC20_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
] as const;

export async function GET() {
  try {
    const sales = await getAllSales();
    const total = sales.reduce((sum, s) => sum + s.count, 0);

    // Treasury bakiyesi
    const client = createPublicClient({ chain: baseSepolia, transport: http("https://sepolia.base.org") });
    const balance = await client.readContract({ address: USDC_SEPOLIA, abi: ERC20_ABI, functionName: "balanceOf", args: [TREASURY] });
    const balanceUsdc = parseFloat(formatUnits(balance, 6));

    const distribution = await getDistributionData(balanceUsdc);

    return NextResponse.json({ sales, total, balance: balanceUsdc, distribution });
  } catch (e) {
    return NextResponse.json({ sales: [], total: 0, balance: 0, distribution: { authors: [], readers: [], totalAuthorEarnings: 0, totalReaderSpending: 0 } });
  }
}
