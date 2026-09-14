"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useState, useEffect } from "react";
import { ACTIVE_CHAIN_ID } from "@/lib/web3";

const WALLET_MAP: Record<string, { name: string; featured?: boolean }> = {
  "coinbaseWalletSDK": { name: "Coinbase Wallet", featured: true },
  "coinbaseWallet":    { name: "Coinbase Wallet", featured: true },
  "injected":          { name: "Browser Wallet" },
  "metaMask":          { name: "MetaMask" },
  "walletConnect":     { name: "WalletConnect" },
  "phantom":           { name: "Phantom" },
  "infinex":           { name: "Infinex" },
};

const ALLOWED = ["coinbaseWalletSDK", "coinbaseWallet", "injected", "walletConnect", "phantom", "infinex"];

export function ConnectButton() {
  const { address, isConnected, chain } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <button className="wallet-pill">
        <div className="w-dot" style={{ background: "#555" }} />
        Connect Wallet
      </button>
    );
  }

  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
  const wrongChain = isConnected && chain?.id !== ACTIVE_CHAIN_ID;

  const seen = new Set<string>();
  const filtered = connectors.filter((c) => {
    if (!ALLOWED.includes(c.id)) return false;
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });

  if (isConnected) {
    return (
      <div style={{ position: "relative" }}>
        <button className="wallet-pill" onClick={() => setOpen((o) => !o)}>
          <div className="w-dot" style={{ background: wrongChain ? "#ef4444" : "#22c55e" }} />
          {wrongChain ? "Wrong Network" : shortAddr}
        </button>
        {open && (
          <div className="wallet-dropdown">
            <div className="wd-addr">{address}</div>
            {wrongChain && <div className="wd-warning">Please switch to Base network</div>}
            <button className="wd-disconnect" onClick={() => { disconnect(); setOpen(false); }}>
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button className="wallet-pill" onClick={() => setOpen((o) => !o)}>
        <div className="w-dot" style={{ background: "#555" }} />
        Connect Wallet
      </button>
      {open && (
        <div className="wallet-dropdown">
          {filtered.map((connector) => {
            const meta = WALLET_MAP[connector.id] || { name: connector.name };
            return (
              <button
                key={connector.id}
                className={`wd-option ${meta.featured ? "wd-featured" : ""}`}
                onClick={async () => {
                  await connectAsync({ connector, chainId: ACTIVE_CHAIN_ID });
                  setOpen(false);
                }}
              >
                <div className="wd-name">{meta.name}</div>
                {meta.featured && <span className="wd-badge">Recommended</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
