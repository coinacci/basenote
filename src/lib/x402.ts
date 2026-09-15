import { createX402Server } from "@x402/next";

export const x402Config = {
  network: "eip155:84532", // Base Sepolia
  facilitatorUrl: "https://x402.org/facilitator",
  payTo: process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS as string,
};

export function createX402ServerInstance() {
  return createX402Server({
    facilitatorUrl: x402Config.facilitatorUrl,
  });
}
