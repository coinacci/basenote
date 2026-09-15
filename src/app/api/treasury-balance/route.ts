import { NextResponse } from "next/server";
import { createPublicClient, http, formatUnits } from "viem";
import { baseSepolia } from "viem/chains";

const USDC_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`;
const TREASURY = process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS as `0x${string}`;

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

export async function GET() {
  try {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http("https://sepolia.base.org"),
    });

    const balance = await client.readContract({
      address: USDC_SEPOLIA,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [TREASURY],
    });

    const balanceUsdc = parseFloat(formatUnits(balance, 6));

    return NextResponse.json({
      balance: balanceUsdc,
      platform: +(balanceUsdc * 0.15).toFixed(2),
      authors: +(balanceUsdc * 0.70).toFixed(2),
      readers: +(balanceUsdc * 0.15).toFixed(2),
    });
  } catch (e) {
    console.error("Treasury balance error:", e);
    return NextResponse.json({ balance: 0, platform: 0, authors: 0, readers: 0 });
  }
}
