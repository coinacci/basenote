"use client";

import { useState } from "react";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

const EXPLORE_CATEGORIES = [
  "Technology", "Gaming", "Travel", "Music", "Food",
  "Fashion", "Sports", "Film & TV", "Life", "Politics",
  "Literature", "Science", "Business",
];

const WEB3_CATEGORIES = [
  "DeFi", "NFT", "AI", "Protocol", "Opinion", "Guide",
];

function slugify(cat: string): string {
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function Nav() {
  const [exploreOpen, setExploreOpen] = useState(false);
  const [web3Open, setWeb3Open] = useState(false);

  const closeAll = () => { setExploreOpen(false); setWeb3Open(false); };

  return (
    <>
      <nav>
        <div className="nav-inner">
          <a className="logo" href="/">BASE<span>NOTE</span></a>

          <div className="nav-links">
            <div style={{ position: "relative" }}>
              <button
                className="nav-dropdown-btn"
                onClick={() => { setExploreOpen((o) => !o); setWeb3Open(false); }}
              >
                Explore ▾
              </button>
              {exploreOpen && (
                <div className="nav-dropdown">
                  <div className="nav-dropdown-label">General</div>
                  <div className="nav-dropdown-grid">
                    {EXPLORE_CATEGORIES.map((cat) => (
                      
                        key={cat}
                        href={"/?cat=" + slugify(cat)}
                        className="nav-dropdown-item"
                        onClick={closeAll}
                      >
                        {cat}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <button
                className="nav-dropdown-btn"
                onClick={() => { setWeb3Open((o) => !o); setExploreOpen(false); }}
              >
                Web3 ▾
              </button>
              {web3Open && (
                <div className="nav-dropdown">
                  <div className="nav-dropdown-label">Web3 & Crypto</div>
                  <div className="nav-dropdown-grid">
                    {WEB3_CATEGORIES.map((cat) => (
                      
                        key={cat}
                        href={"/?cat=" + slugify(cat)}
                        className="nav-dropdown-item"
                        onClick={closeAll}
                      >
                        {cat}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <a href="/treasury">Treasury</a>
            <a href="/about">About</a>
          </div>

          <div className="nav-right">
            <ThemeSwitcher />
            <ConnectButton />
            <a className="btn-write" href="/dashboard">Write</a>
          </div>
        </div>
      </nav>

      {(exploreOpen || web3Open) && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99 }}
          onClick={closeAll}
        />
      )}
    </>
  );
}
