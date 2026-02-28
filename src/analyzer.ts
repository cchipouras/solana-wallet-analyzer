import { SolanaService } from './services/solana';
import { PricingService } from './services/pricing';
import { MetadataService } from './services/metadata';
import { LabelService } from './services/labels';
import {
  WalletAnalysis,
  TokenHolding,
  NFTHolding,
  Transaction,
  PortfolioMetrics,
  AnalyzerConfig,
} from './types';

export class WalletAnalyzer {
  private solana: SolanaService;
  private pricing: PricingService;
  private metadata: MetadataService;
  private labels: LabelService;

  constructor(config: AnalyzerConfig = { rpcUrl: 'https://api.mainnet-beta.solana.com' }) {
    this.solana = new SolanaService(config.rpcUrl);
    this.pricing = new PricingService();
    this.metadata = new MetadataService();
    this.labels = new LabelService();
  }

  async analyze(address: string): Promise<WalletAnalysis> {
    // Validate address
    if (!this.solana.isValidAddress(address)) {
      throw new Error(`Invalid Solana address: ${address}`);
    }

    // Fetch data in parallel
    const [
      solBalance,
      solPrice,
      rawTokens,
      walletAge,
      signatures,
    ] = await Promise.all([
      this.solana.getSolBalance(address),
      this.pricing.getSolPrice(),
      this.solana.getTokenAccounts(address),
      this.solana.getAccountAge(address),
      this.solana.getTransactionHistory(address, 10),
    ]);

    // Enrich token data
    let tokens = await this.metadata.enrichTokenMetadata(rawTokens);
    tokens = await this.pricing.enrichTokensWithPrices(tokens);

    // Filter out tokens with no value
    tokens = tokens.filter(t => t.valueUsd > 0.01);

    // Get NFTs (placeholder - would need Metaplex for full implementation)
    const nfts: NFTHolding[] = [];

    // Calculate totals
    const solValueUsd = solBalance * solPrice;
    const tokenValueUsd = tokens.reduce((sum, t) => sum + t.valueUsd, 0);
    const totalValueUsd = solValueUsd + tokenValueUsd;

    // Get labels
    const walletLabels = this.labels.getLabels(address);

    // Calculate risk score (0-100, higher = riskier)
    const riskScore = this.calculateRiskScore(tokens, solBalance, walletAge);

    return {
      address,
      solBalance,
      solValueUsd,
      tokens,
      nfts,
      totalValueUsd,
      walletAge,
      transactionCount: signatures.length,
      lastActivity: signatures.length > 0 
        ? new Date((signatures[0].blockTime || 0) * 1000)
        : new Date(),
      labels: walletLabels,
      riskScore,
    };
  }

  async getTokens(address: string): Promise<TokenHolding[]> {
    const rawTokens = await this.solana.getTokenAccounts(address);
    let tokens = await this.metadata.enrichTokenMetadata(rawTokens);
    tokens = await this.pricing.enrichTokensWithPrices(tokens);
    return tokens.filter(t => t.valueUsd > 0).sort((a, b) => b.valueUsd - a.valueUsd);
  }

  async getNFTs(address: string): Promise<NFTHolding[]> {
    // This would require Metaplex or Helius for full implementation
    // Placeholder for now
    return [];
  }

  async getTransactions(address: string, limit: number = 100): Promise<Transaction[]> {
    const signatures = await this.solana.getTransactionHistory(address, limit);
    
    const transactions: Transaction[] = [];
    
    for (const sig of signatures.slice(0, 20)) {
      const tx = await this.solana.getTransactionDetails(sig.signature);
      if (tx) {
        transactions.push(tx);
      }
    }

    return transactions;
  }

  async getPortfolioMetrics(analysis: WalletAnalysis): Promise<PortfolioMetrics> {
    const totalValue = analysis.totalValueUsd;
    
    // Calculate allocations
    const solAllocation = (analysis.solValueUsd / totalValue) * 100;
    const tokenValue = analysis.tokens.reduce((sum, t) => sum + t.valueUsd, 0);
    const tokenAllocation = (tokenValue / totalValue) * 100;
    const nftAllocation = 0; // Would need NFT floor prices

    // Top holdings
    const allHoldings = [
      { name: 'SOL', value: analysis.solValueUsd },
      ...analysis.tokens.map(t => ({ name: t.symbol, value: t.valueUsd })),
    ].sort((a, b) => b.value - a.value);

    const topHoldings = allHoldings.slice(0, 5).map(h => ({
      name: h.name,
      percentage: (h.value / totalValue) * 100,
    }));

    // Diversification score (0-100, higher = more diversified)
    const hhi = allHoldings.reduce((sum, h) => {
      const share = h.value / totalValue;
      return sum + share * share;
    }, 0);
    const diversificationScore = Math.max(0, Math.min(100, (1 - hhi) * 100));

    // Risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    if (analysis.riskScore < 30) riskLevel = 'low';
    else if (analysis.riskScore > 70) riskLevel = 'high';

    return {
      totalValue,
      solAllocation,
      tokenAllocation,
      nftAllocation,
      diversificationScore,
      topHoldings,
      riskLevel,
    };
  }

  private calculateRiskScore(
    tokens: TokenHolding[],
    solBalance: number,
    walletAge: number
  ): number {
    let score = 50; // Start neutral

    // More SOL = lower risk
    if (solBalance > 100) score -= 10;
    if (solBalance > 1000) score -= 10;

    // Older wallet = lower risk
    if (walletAge > 365) score -= 10;
    if (walletAge > 730) score -= 10;

    // Many small-cap tokens = higher risk
    const unknownTokens = tokens.filter(t => !t.symbol || t.symbol.length > 8);
    score += unknownTokens.length * 2;

    // Highly concentrated = higher risk
    if (tokens.length > 0) {
      const topTokenValue = tokens[0]?.valueUsd || 0;
      const totalValue = tokens.reduce((s, t) => s + t.valueUsd, 0);
      if (topTokenValue / totalValue > 0.5) score += 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  isValidAddress(address: string): boolean {
    return this.solana.isValidAddress(address);
  }
}

// Export as default for easy importing
export default WalletAnalyzer;
