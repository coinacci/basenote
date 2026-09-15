import { NextRequest, NextResponse } from "next/server";
import { redis, getDistributionData } from "@/lib/redis";
import { createWalletClient, createPublicClient, http, parseAbi } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

const DISTRIBUTE_SECRET = process.env.DISTRIBUTE_SECRET || "basenote-distribute-secret";

const TREASURY_ABI = parseAbi([
  "function distribute(address[] calldata authors, uint256[] calldata authorShares, address[] calldata readers, uint256[] calldata readerShares) external",
  "function nextDistributionAt() external view returns (uint256)",
]);

export async function POST(req: NextRequest) {
  // Güvenlik kontrolü
  const secret = req.headers.get("x-distribute-secret");
  if (secret !== DISTRIBUTE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const TREASURY = process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS as `0x${string}`;
    const PRIVATE_KEY = process.env.DISTRIBUTE_PRIVATE_KEY as `0x${string}`;

    if (!PRIVATE_KEY) {
      return NextResponse.json({ error: "No private key configured" }, { status: 500 });
    }

    const account = privateKeyToAccount(PRIVATE_KEY);
    const publicClient = createPublicClient({ chain: base, transport: http("https://mainnet.base.org") });
    const walletClient = createWalletClient({ account, chain: base, transport: http("https://mainnet.base.org") });

    // Contract'ta süre dolmuş mu kontrol et
    const nextDistAt = await publicClient.readContract({
      address: TREASURY,
      abi: TREASURY_ABI,
      functionName: "nextDistributionAt",
    });

    const now = BigInt(Math.floor(Date.now() / 1000));
    if (now < nextDistAt) {
      return NextResponse.json({
        error: "Distribution cycle not ended yet",
        nextDistAt: nextDistAt.toString(),
      }, { status: 400 });
    }

    // USDC bakiyesi
    const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`;
    const ERC20_ABI = parseAbi(["function balanceOf(address) view returns (uint256)"]);
    const balance = await publicClient.readContract({
      address: USDC,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [TREASURY],
    });

    if (balance === 0n) {
      return NextResponse.json({ error: "Treasury is empty" }, { status: 400 });
    }

    // Redis'ten dağıtım verisi al
    const balanceUsdc = Number(balance) / 1_000_000;
    const distribution = await getDistributionData(balanceUsdc);

    const authors = distribution.authors.map((a) => a.address as `0x${string}`);
    const authorShares = distribution.authors.map((a) => BigInt(Math.round(a.earned * 1_000_000)));
    const readers = distribution.readers.map((r) => r.address as `0x${string}`);
    const readerShares = distribution.readers.map((r) => BigInt(Math.round(r.spent * 1_000_000)));

    // Snapshot al — mevcut dönem verilerini kaydet
    const cycleId = Date.now();
    await takeSnapshot(cycleId, distribution, balanceUsdc);

    // Contract'ı çağır
    const hash = await walletClient.writeContract({
      address: TREASURY,
      abi: TREASURY_ABI,
      functionName: "distribute",
      args: [authors, authorShares, readers, readerShares],
    });

    // TX onayını bekle
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    // Redis'i sıfırla — yeni dönem
    await resetCycle();

    return NextResponse.json({
      success: true,
      txHash: hash,
      blockNumber: receipt.blockNumber.toString(),
      cycleId,
      distributed: {
        balance: balanceUsdc,
        authors: distribution.authors.length,
        readers: distribution.readers.length,
      },
    });
  } catch (e: unknown) {
    console.error("Distribute error:", e);
    return NextResponse.json({
      error: e instanceof Error ? e.message : "Distribution failed",
    }, { status: 500 });
  }
}

async function takeSnapshot(cycleId: number, distribution: Awaited<ReturnType<typeof getDistributionData>>, balance: number) {
  const snapshot = {
    cycleId,
    timestamp: new Date().toISOString(),
    balance,
    authors: distribution.authors,
    readers: distribution.readers,
    totalAuthorEarnings: distribution.totalAuthorEarnings,
    totalReaderSpending: distribution.totalReaderSpending,
  };

  // Snapshot'ı kalıcı olarak sakla
  await redis.set(`snapshot:${cycleId}`, JSON.stringify(snapshot));

  // Snapshot listesine ekle
  await redis.lpush("snapshot-list", cycleId.toString());
}

async function resetCycle() {
  // Aktif dönem verilerini sil
  const authorKeys = await redis.keys("author-earnings:*");
  const readerKeys = await redis.keys("reader-spending:*");
  const salesKeys = await redis.keys("sales:*");

  const allKeys = [...authorKeys, ...readerKeys, ...salesKeys,
    "total-author-earnings", "total-reader-spending"];

  for (const key of allKeys) {
    await redis.del(key);
  }
}
