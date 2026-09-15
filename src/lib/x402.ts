import { x402ResourceServer } from "@x402/next";

export const x402Config = {
  network: "eip155:84532", // Base Sepolia
  facilitatorUrl: "https://x402.org/facilitator",
  payTo: process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS as string,
};

export function createX402ServerInstance() {
  return x402ResourceServer({
    facilitatorUrl: x402Config.facilitatorUrl,
  });
}
