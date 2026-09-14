"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { coinbaseWallet, metaMask, walletConnect } from "wagmi/connectors";
import { useState } from "react";
import { ACTIVE_CHAIN_ID } from "@/lib/web3";

export function ConnectButton() {
  const { address, isConnected, chain } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);

  const shortAddr = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : "";

  const wrongChain = isConnected && chain?.id !== ACTIVE_CHAIN_ID;

  if (isConnected) {
    return (
      <div style={{ position: "relative" }}>
        <button
          className="wallet-pill"
          onClick={() => setOpen((o) => !o)}
        >
          <div className="w-dot" style={{ background: wrongChain ? "#ef4444" : "#22c55e" }} />
          {wrongChain ? "Yanlış ağ" : shortAddr}
        </button>
        {open && (
          <div className="wallet-dropdown">
            <div className="wd-addr">{address}</div>
            {wrongChain && (
              <div className="wd-warning">
                Base ağına geçin (Chain ID: {ACTIVE_CHAIN_ID})
              </div>
           )}
            <button className="wd-disconnect" onClick={() => { disconnect(); setOpen(false); }}>
              Bağlantıyı kes
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button className="wallet-pill" onClick={() => setOpen((o) => !o)}>
        <div className="w-dot" style={{ background: "#94a3b8" }} />
        Cüzdan bağla
      </button>
      {open && (
        <div className="wallet-dropdown">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              className={`wd-option ${connector.id === "coinbaseWalletSDK" ? "wd-featured" : ""}`}
              onClick={async () => {
                await connectAsync({ connector, chainId: ACTIVE_CHAIN_ID });
                setOpen(false);
              }}
            >
              <span className="wd-icon">
                {connector.id === "coinbaseWalletSDK" ? "CB" :
                 connector.id === "metaMask" ? "MM" :
                 connector.id === "walletConnect" ? "WC" : "EVM"}
              </span>
              <span>
                <div className="wd-name">{connector.name}</div>
                {connector.id === "coinbaseWalletSDK" && (
                  <div className="wd-sub">Base App desteği</div>
                )}
              </span>
              {connector.id === "coinbaseWalletSDK" && (
                <span className="wd-badge">Önerilen</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
