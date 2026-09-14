import { http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { metaMask, walletConnect, injected, coinbaseWallet } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

export const wagmiConfig = createConfig({
  chains: [baseSepolia, base],
  connectors: [
    coinbaseWallet({
      appName: "basenote",
      appLogoUrl: "https://basenotes.vercel.app/favicon.ico",
    }),
    injected(),
    metaMask(),
    walletConnect({ projectId }),
  ],
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"),
    [base.id]: http("https://mainnet.base.org"),
  },
});

export const ACTIVE_CHAIN_ID = parseInt(
  process.env.NEXT_PUBLIC_CHAIN_ID || "84532"
);

export const USDC_ADDRESS =
  ACTIVE_CHAIN_ID === 8453
    ? (process.env.NEXT_PUBLIC_USDC_ADDRESS_MAINNET as `0x${string}`)
    : (process.env.NEXT_PUBLIC_USDC_ADDRESS_SEPOLIA as `0x${string}`);

export const TREASURY_ADDRESS = process.env
  .NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS as `0x${string}`;
