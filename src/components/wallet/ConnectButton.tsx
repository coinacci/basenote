"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useState, useEffect } from "react";
import { ACTIVE_CHAIN_ID } from "@/lib/web3";

const WALLET_MAP: Record<string, { icon: string; name: string; featured?: boolean }> = {
  "coinbaseWallet":   { icon: "CB", name: "Coinbase Wallet", featured: true },
  "injected":         { icon: "🌐", name: "Browser Wallet" },
  "metaMask":         { icon: "MM", name: "MetaMask" },
  "walletConnect":    { icon: "WC", name: "WalletConnect" },
  "phantom":          { icon: "👻", name: "Phantom" },
  "infinex":          { icon: "IX", name: "Infinex" },
};

const ALLOWED = ["coinbaseWallet", "injected", "walletConnect", "phantom", "infinex"];

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

  // Sadece izin verilen connector'ları filtrele, tekrar edenleri kaldır
  const seen = new Set<string>();
  const filtered = connectors.filter((c) => {
    const id = c.id;
    if (!ALLOWED.includes(id)) return false;
    if (seen.has(id)) return false;
    seen.add(id);
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
            const meta = WALLET_MAP[connector.id] || { icon: "EVM", name: connector.name };
            return (
              <button
                key={connector.id}
                className={`wd-option ${meta.featured ? "wd-featured" : ""}`}
                onClick={async () => {
                  await connectAsync({ connector, chainId: ACTIVE_CHAIN_ID });
                  setOpen(false);
                }}
              >
                <span className="wd-icon" style={meta.featured ? { background: "#0052FF", color: "#fff" } : {}}>
                  {meta.icon}
                </span>
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
