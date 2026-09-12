export const TREASURY_ABI = [
  // Yazar
  {
    name: "publishArticle",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "articleId", type: "bytes32" },
      { name: "priceUsdc", type: "uint256" },
    ],
    outputs: [],
  },
  // Okuyucu — x402 akışı
  {
    name: "purchaseArticle",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "articleId", type: "bytes32" }],
    outputs: [],
  },
  // View
  {
    name: "treasuryBalance",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "nextDistributionAt",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "getAuthorStats",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "author", type: "address" }],
    outputs: [
      { name: "earned", type: "uint256" },
      { name: "reads", type: "uint256" },
    ],
  },
  {
    name: "articlePrice",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "articleId", type: "bytes32" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "articleAuthor",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "articleId", type: "bytes32" }],
    outputs: [{ type: "address" }],
  },
  // Events
  {
    name: "ArticlePurchased",
    type: "event",
    inputs: [
      { name: "articleId", type: "bytes32", indexed: true },
      { name: "reader", type: "address", indexed: true },
      { name: "author", type: "address", indexed: true },
      { name: "price", type: "uint256" },
    ],
  },
  {
    name: "ArticlePublished",
    type: "event",
    inputs: [
      { name: "articleId", type: "bytes32", indexed: true },
      { name: "author", type: "address", indexed: true },
      { name: "price", type: "uint256" },
    ],
  },
] as const;

export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;
