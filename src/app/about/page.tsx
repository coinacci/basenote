export default function AboutPage() {
  return (
    <div className="main" style={{ paddingTop: "2rem", paddingBottom: "4rem", maxWidth: "680px" }}>

      <div style={{ background: "var(--gold)", padding: ".4rem .75rem", marginBottom: "2rem", display: "inline-block" }}>
        <span style={{ fontFamily: "var(--font-sub)", fontSize: ".82rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#0a0a0a" }}>About Basenote</span>
      </div>

      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.2rem", color: "var(--ink)", textTransform: "uppercase", lineHeight: 1.1, marginBottom: "1rem" }}>
        A content platform built on Base.
      </h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: ".95rem", color: "var(--muted)", lineHeight: 1.8, marginBottom: "3rem" }}>
        Basenote is an onchain publishing platform where writers earn directly from readers — no ads, no middlemen, no subscriptions. Every article is unlocked with a one-time USDC payment via the x402 protocol. All payments flow into a shared treasury that is distributed monthly to writers, readers, and the platform.
      </p>

      <div style={{ borderLeft: "3px solid var(--gold)", paddingLeft: "1.2rem", marginBottom: "3rem" }}>
        <div style={{ fontFamily: "var(--font-sub)", fontSize: ".72rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: ".4rem" }}>Tagline</div>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", color: "var(--ink)", textTransform: "uppercase" }}>Read. Pay once. Earn forever.</div>
      </div>

      {/* HOW IT WORKS */}
      <h2 style={{ fontFamily: "var(--font-sub)", fontSize: "1rem", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: ".1em", borderBottom: "2px solid var(--ink)", paddingBottom: ".5rem", marginBottom: "1.5rem" }}>How It Works</h2>

      {[
        { num: "01", title: "Writer publishes", desc: "Connect your EVM wallet, write your article, set your price in USDC. No transaction required to publish — just fill in the form and go live instantly." },
        { num: "02", title: "Reader pays with x402", desc: "When a reader clicks to read, the x402 protocol triggers a one-time USDC payment on Base. Gas costs less than $0.001. The payment goes directly into the Basenote treasury smart contract." },
        { num: "03", title: "Treasury accumulates", desc: "All read payments pool into the shared treasury contract on Base. The balance is visible in real time on the Treasury page." },
        { num: "04", title: "Monthly distribution", desc: "At the end of each month, the treasury is distributed to writers, readers, and the platform — proportionally, based on contribution." },
      ].map((s) => (
        <div key={s.num} style={{ display: "flex", gap: "1.2rem", marginBottom: "1.5rem" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", color: "var(--gray-2)", flexShrink: 0, width: "2rem", textAlign: "center" }}>{s.num}</div>
          <div>
            <div style={{ fontFamily: "var(--font-sub)", fontSize: ".88rem", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", marginBottom: ".3rem" }}>{s.title}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: ".85rem", color: "var(--muted)", lineHeight: 1.7 }}>{s.desc}</div>
          </div>
        </div>
      ))}

      {/* X402 */}
      <h2 style={{ fontFamily: "var(--font-sub)", fontSize: "1rem", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: ".1em", borderBottom: "2px solid var(--ink)", paddingBottom: ".5rem", marginBottom: "1.5rem", marginTop: "2.5rem" }}>What is x402?</h2>
      <p style={{ fontFamily: "var(--font-body)", fontSize: ".88rem", color: "var(--muted)", lineHeight: 1.8, marginBottom: "1rem" }}>
        x402 is an open payment protocol built on HTTP status code 402 — "Payment Required." When a reader requests a paywalled article, the server responds with a 402 and payment details. The reader's wallet automatically signs and broadcasts a USDC transaction on Base. Once confirmed, the content is unlocked — all within a single request cycle.
      </p>
      <p style={{ fontFamily: "var(--font-body)", fontSize: ".88rem", color: "var(--muted)", lineHeight: 1.8, marginBottom: "3rem" }}>
        There are no subscriptions, no saved payment methods, and no centralized processor. Payments are peer-to-contract, settled on-chain, and cost fractions of a cent in gas.
      </p>

      {/* TREASURY */}
      <h2 style={{ fontFamily: "var(--font-sub)", fontSize: "1rem", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: ".1em", borderBottom: "2px solid var(--ink)", paddingBottom: ".5rem", marginBottom: "1.5rem" }}>Treasury & Distribution</h2>
      <p style={{ fontFamily: "var(--font-body)", fontSize: ".88rem", color: "var(--muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
        Every USDC payment made on Basenote flows into the shared treasury contract. At the end of each monthly cycle, the balance is split three ways:
      </p>

      <div style={{ border: "1px solid var(--gray-2)", marginBottom: "2rem", overflow: "hidden" }}>
        {[
          { party: "Platform", pct: "15%", color: "var(--ink)", desc: "Covers infrastructure, development, and operations." },
          { party: "Authors", pct: "70%", color: "var(--crimson)", desc: "Distributed proportionally based on USDC earned that cycle." },
          { party: "Readers", pct: "15%", color: "var(--gold)", desc: "Distributed proportionally based on USDC spent that cycle." },
        ].map((r, i) => (
          <div key={r.party} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: ".9rem 1.2rem", borderBottom: i < 2 ? "1px solid var(--gray-2)" : "none" }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: r.color, flexShrink: 0 }} />
            <div style={{ fontFamily: "var(--font-sub)", fontSize: ".85rem", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", minWidth: "80px" }}>{r.party}</div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: r.color, minWidth: "48px" }}>{r.pct}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: ".8rem", color: "var(--muted)" }}>{r.desc}</div>
          </div>
        ))}
      </div>

      {/* FORMULA */}
      <h2 style={{ fontFamily: "var(--font-sub)", fontSize: "1rem", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: ".1em", borderBottom: "2px solid var(--ink)", paddingBottom: ".5rem", marginBottom: "1.5rem" }}>Distribution Formula</h2>

      <p style={{ fontFamily: "var(--font-body)", fontSize: ".88rem", color: "var(--muted)", lineHeight: 1.8, marginBottom: "1.2rem" }}>
        The author pool (70% of treasury) is split proportionally by how much each author earned from reads during the cycle — not by read count alone, but by actual USDC collected:
      </p>

      <div style={{ background: "var(--gray)", border: "1px solid var(--gray-2)", padding: "1.2rem 1.5rem", marginBottom: "1.5rem", fontFamily: "monospace", fontSize: ".85rem", color: "var(--ink)", lineHeight: 2 }}>
        <div>Author Share =</div>
        <div style={{ paddingLeft: "1.5rem", borderLeft: "3px solid var(--crimson)", marginLeft: ".5rem" }}>
          (Author's total USDC earned this cycle)<br />
          ─────────────────────────────────── × Author Pool<br />
          (All authors' total USDC earned this cycle)
        </div>
      </div>

      <p style={{ fontFamily: "var(--font-body)", fontSize: ".88rem", color: "var(--muted)", lineHeight: 1.8, marginBottom: "1.2rem" }}>
        The reader pool (15% of treasury) follows the same logic — based on how much each reader spent:
      </p>

      <div style={{ background: "var(--gray)", border: "1px solid var(--gray-2)", padding: "1.2rem 1.5rem", marginBottom: "2.5rem", fontFamily: "monospace", fontSize: ".85rem", color: "var(--ink)", lineHeight: 2 }}>
        <div>Reader Share =</div>
        <div style={{ paddingLeft: "1.5rem", borderLeft: "3px solid var(--gold)", marginLeft: ".5rem" }}>
          (Reader's total USDC spent this cycle)<br />
          ─────────────────────────────────── × Reader Pool<br />
          (All readers' total USDC spent this cycle)
        </div>
      </div>

      <div style={{ background: "var(--gray)", border: "1px solid var(--gray-2)", padding: "1.2rem 1.5rem" }}>
        <div style={{ fontFamily: "var(--font-sub)", fontSize: ".72rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".6rem" }}>Example</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: ".83rem", color: "var(--muted)", lineHeight: 1.8 }}>
          Treasury: <strong style={{ color: "var(--ink)" }}>1,000 USDC</strong><br />
          Author pool: <strong style={{ color: "var(--ink)" }}>700 USDC</strong><br /><br />
          Writer A earned 50 USDC from reads. Writer B earned 200 USDC.<br />
          Total author earnings: 250 USDC.<br /><br />
          Writer A receives: (50 / 250) × 700 = <strong style={{ color: "var(--crimson)" }}>140 USDC</strong><br />
          Writer B receives: (200 / 250) × 700 = <strong style={{ color: "var(--crimson)" }}>560 USDC</strong>
        </div>
      </div>

    </div>
  );
}
