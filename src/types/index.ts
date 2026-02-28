import { PublicKey } from '@solana/web3.js';

export interface WalletAnalysis {
  address: string;
  solBalance: number;
  solValueUsd: number;
  tokens: TokenHolding[];
  nfts: NFTHolding[];
  totalValueUsd: number;
  walletAge: number; // days
  transactionCount: number;
  lastActivity: Date;
  labels: string[];
  riskScore: number;
}

export interface TokenHolding {
  mint: string;
  symbol: string;
  name: string;
  amount: number;
  decimals: number;
  uiAmount: number;
  priceUsd: number;
  valueUsd: number;
  change24h: number;
  logoUri?: string;
}

export interface NFTHolding {
  mint: string;
  name: string;
  collection?: string;
  image?: string;
  attributes?: Record<string, string>;
  floorPrice?: number;
  lastSale?: number;
  verified: boolean;
}

export interface Transaction {
  signature: string;
  blockTime: number;
  slot: number;
  type: TransactionType;
  status: 'success' | 'failed';
  fee: number;
  from?: string;
  to?: string;
  amount?: number;
  token?: string;
  description?: string;
}

export type TransactionType = 
  | 'transfer'
  | 'swap'
  | 'stake'
  | 'unstake'
  | 'nft-mint'
  | 'nft-transfer'
  | 'nft-sale'
  | 'defi'
  | 'unknown';

export interface PortfolioMetrics {
  totalValue: number;
  solAllocation: number;
  tokenAllocation: number;
  nftAllocation: number;
  diversificationScore: number;
  topHoldings: Array<{ name: string; percentage: number }>;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface PriceData {
  symbol: string;
  priceUsd: number;
  change24h: number;
  marketCap?: number;
  volume24h?: number;
}

export interface AnalyzerConfig {
  rpcUrl: string;
  cacheEnabled?: boolean;
  cacheTtl?: number;
  priceApiKey?: string;
}

export interface WalletLabel {
  address: string;
  name: string;
  type: 'exchange' | 'protocol' | 'whale' | 'dao' | 'nft-project' | 'other';
  verified: boolean;
}

export interface CommandOptions {
  limit?: number;
  sort?: string;
  format?: 'table' | 'json' | 'csv';
  output?: string;
  minValue?: number;
  type?: string;
  after?: string;
  before?: string;
  verifiedOnly?: boolean;
  collection?: string;
}
