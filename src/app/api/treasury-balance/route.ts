import { NextResponse } from "next/server";
import { createPublicClient, http, formatUnits } from "viem";
import { base } from "viem/chains";

const USDC_MAINNET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`;
const TREASURY = process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS as `0x${string}`;

const ERC20_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
] as const;

const TREASURY_ABI = [
  { name: "nextDistributionAt", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;

export async function GET() {
  const client = createPublicClient({
    chain: base,
    transport: http("https://mainnet.base.org"),
  });

  let balance = 0;
  let nextDistributionAt = "0";

  try {
    const raw = await client.readContract({
      address: USDC_MAINNET,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [TREASURY],
    });
    balance = parseFloat(formatUnits(raw, 6));
  } catch (e) {
    console.error("Balance error:", e);
  }

  try {
    const raw = await client.readContract({
      address: TREASURY,
      abi: TREASURY_ABI,
      functionName: "nextDistributionAt",
    });
    nextDistributionAt = raw.toString();
  } catch (e) {
    console.error("NextDistAt error:", e);
  }

  return NextResponse.json({
    balance,
    platform: +(balance * 0.15).toFixed(2),
    authors: +(balance * 0.70).toFixed(2),
    readers: +(balance * 0.15).toFixed(2),
    nextDistributionAt,
  });
}
