import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Network:", network.name);

  // USDC adresi — ağa göre seç
  const USDC =
    network.name === "base"
      ? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" // Base Mainnet USDC
      : "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia USDC

  const platformWallet = deployer.address; // başlangıçta deployer, sonradan değiştirilir

  console.log("USDC address:", USDC);
  console.log("Platform wallet:", platformWallet);

  const Treasury = await ethers.getContractFactory("BasenoteTreasury");
  const treasury = await Treasury.deploy(USDC, platformWallet);
  await treasury.waitForDeployment();

  const address = await treasury.getAddress();
  console.log("\n✅ BasenoteTreasury deployed:", address);
  console.log("\nNow add to .env:");
  console.log(`NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
