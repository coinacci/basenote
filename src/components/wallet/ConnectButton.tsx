"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useState, useEffect } from "react";
import { ACTIVE_CHAIN_ID } from "@/lib/web3";

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

  const getLabel = (id: string) => {
    if (id === "coinbaseWallet") return { icon: "CB", name: "Coinbase Wallet", sub: "Base App support", featured: true };
    if (id === "metaMask") return { icon: "MM", name: "MetaMask", sub: "EVM browser wallet", featured: false };
    if (id === "walletConnect") return { icon: "WC", name: "WalletConnect", sub: "300+ mobile wallets", featured: false };
    return { icon: "EVM", name: "Other EVM Wallets", sub: "Rabby and others", featured: false };
  };

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
          {connectors.map((connector) => {
            const label = getLabel(connector.id);
            return (
              <button
                key={connector.id}
                className={`wd-option ${label.featured ? "wd-featured" : ""}`}
                onClick={async () => {
                  await connectAsync({ connector, chainId: ACTIVE_CHAIN_ID });
                  setOpen(false);
                }}
              >
                <span className="wd-icon" style={label.featured ? { background: "#0052FF", color: "#fff" } : {}}>
                  {label.icon}
                </span>
                <span>
                  <div className="wd-name">{label.name}</div>
                  <div className="wd-sub">{label.sub}</div>
                </span>
                {label.featured && <span className="wd-badge">Recommended</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
