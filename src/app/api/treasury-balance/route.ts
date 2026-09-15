import { NextResponse } from "next/server";
import { createPublicClient, http, formatUnits } from "viem";
import { base } from "viem/chains";

const USDC_MAINNET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`;
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
      chain: base,
      transport: http("https://mainnet.base.org"),
    });

    const balance = await client.readContract({
      address: USDC_MAINNET,
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
