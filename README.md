# basenote

Base blockchain üzerinde x402 protokolü ile çalışan içerik platformu.  
Yazarlar yazar → okuyucular USDC öder → kasa aylık dağıtır.

## Mimari

```
Frontend   Next.js 14 + TypeScript
Cüzdan     wagmi v2 + Coinbase Wallet (OnchainKit) + WalletConnect
Ödeme      x402 protokolü — USDC (Base)
Kontrat    BasenoteTreasury.sol (Hardhat / Solidity 0.8.24)
Ağ         Base Sepolia (testnet) → Base Mainnet
```

## Kurulum

```bash
git clone https://github.com/KULLANICI/basenote
cd basenote
npm install

cp .env.example .env.local
# .env.local dosyasını düzenle (aşağıya bak)
```

## Environment Variables

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=   # cloud.walletconnect.com
NEXT_PUBLIC_ONCHAINKIT_API_KEY=          # portal.cdp.coinbase.com
NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS=   # deploy sonrası
NEXT_PUBLIC_USDC_ADDRESS_SEPOLIA=0x036CbD53842c5426634e7929541eC2318f3dCF7e
NEXT_PUBLIC_USDC_ADDRESS_MAINNET=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_CHAIN_ID=84532               # 84532=Sepolia, 8453=Mainnet

PRIVATE_KEY=                             # deployer cüzdan private key
BASESCAN_API_KEY=                        # basescan.org/myapikey
```

## Smart Contract Deploy

```bash
# Testnet (Base Sepolia)
npm run deploy:testnet

# Mainnet
npm run deploy:mainnet

# Verify (Basescan)
npm run verify:testnet -- --address 0xDEPLOYED_ADDRESS
```

## Frontend Çalıştır

```bash
npm run dev       # http://localhost:3000
npm run build
npm run start
```

## Vercel Deploy

```bash
npx vercel --prod
# NEXT_PUBLIC_* değişkenleri Vercel dashboard'dan ekle
```

## Proje Yapısı

```
contracts/
  BasenoteTreasury.sol    # Ana kontrat — kasa + dağıtım
scripts/
  deploy.ts               # Hardhat deploy
src/
  app/
    page.tsx              # Ana sayfa
    dashboard/page.tsx    # Yazar dashboard
    treasury/page.tsx     # Kasa sayfası
    layout.tsx            # Nav + footer
    globals.css           # Tüm stiller
  components/
    wallet/ConnectButton.tsx   # Cüzdan bağlantısı
    article/PaymentModal.tsx   # x402 ödeme modal
    ui/TreasuryStrip.tsx       # Kasa şeridi
    layout/Providers.tsx       # wagmi + queryClient
  hooks/
    useX402Payment.ts     # approve + purchase akışı
    useTreasury.ts        # kontrat veri hook'ları
  lib/
    web3.ts               # wagmi config, chain, adresler
    abis.ts               # kontrat ABI'ları
    articles.ts           # mock veri (DB gelene kadar)
  types/
    index.ts              # TypeScript tipleri
```

## x402 Ödeme Akışı

1. Okuyucu yazıya tıklar
2. `PaymentModal` açılır — fiyat ve özet gösterilir
3. `useX402Payment.pay()` çağrılır:
   - USDC allowance kontrol edilir
   - Yetersizse `IERC20.approve(treasury, amount)` cüzdana gönderilir
   - Onay sonrası `treasury.purchaseArticle(articleId)` çağrılır
4. Kontrat ödemeyi kasaya kilitler, okuma sayısını artırır
5. Frontend içeriği açar

## Aylık Dağıtım

`treasury.distribute(topAuthors, weights, topReaders, weights)` çağrısı:
- Platform: %26
- Yazarlar: %56 — okuma sayısına ağırlıklı
- Okuyucular: %18 — harcama miktarına ağırlıklı

---

Built on Base · x402 · USDC
