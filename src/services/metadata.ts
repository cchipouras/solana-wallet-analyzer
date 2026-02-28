import axios from 'axios';
import { TokenHolding, NFTHolding } from '../types';

// Known token metadata (subset of popular tokens)
const KNOWN_TOKENS: Record<string, { symbol: string; name: string; logoUri?: string }> = {
  'So11111111111111111111111111111111111111112': { symbol: 'SOL', name: 'Solana' },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', name: 'USD Coin' },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { symbol: 'USDT', name: 'Tether USD' },
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': { symbol: 'mSOL', name: 'Marinade Staked SOL' },
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': { symbol: 'BONK', name: 'Bonk' },
  '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': { symbol: 'ETH', name: 'Wrapped Ether' },
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': { symbol: 'JUP', name: 'Jupiter' },
  'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3': { symbol: 'PYTH', name: 'Pyth Network' },
  'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL': { symbol: 'JTO', name: 'Jito' },
  'WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk': { symbol: 'WEN', name: 'Wen' },
  'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof': { symbol: 'RENDER', name: 'Render Token' },
  'hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux': { symbol: 'HNT', name: 'Helium' },
};

export class MetadataService {
  private tokenListCache: Map<string, any> = new Map();
  private nftCache: Map<string, NFTHolding> = new Map();

  async enrichTokenMetadata(tokens: TokenHolding[]): Promise<TokenHolding[]> {
    const enriched: TokenHolding[] = [];

    for (const token of tokens) {
      const known = KNOWN_TOKENS[token.mint];
      
      if (known) {
        enriched.push({
          ...token,
          symbol: known.symbol,
          name: known.name,
          logoUri: known.logoUri,
        });
      } else {
        // Try to fetch from Jupiter token list
        const metadata = await this.fetchTokenMetadata(token.mint);
        enriched.push({
          ...token,
          symbol: metadata?.symbol || token.mint.slice(0, 6),
          name: metadata?.name || 'Unknown Token',
          logoUri: metadata?.logoURI,
        });
      }
    }

    return enriched;
  }

  private async fetchTokenMetadata(mint: string): Promise<any> {
    // Check cache first
    if (this.tokenListCache.has(mint)) {
      return this.tokenListCache.get(mint);
    }

    try {
      // Try Jupiter strict token list
      const response = await axios.get(
        `https://tokens.jup.ag/token/${mint}`,
        { timeout: 5000 }
      );
      
      if (response.data) {
        this.tokenListCache.set(mint, response.data);
        return response.data;
      }
    } catch {
      // Token not found in Jupiter
    }

    return null;
  }

  async getNFTMetadata(mint: string): Promise<NFTHolding | null> {
    // Check cache
    if (this.nftCache.has(mint)) {
      return this.nftCache.get(mint)!;
    }

    try {
      // Try Helius DAS API (if available) or fallback to on-chain
      const response = await axios.post(
        'https://mainnet.helius-rpc.com/?api-key=YOUR_KEY',
        {
          jsonrpc: '2.0',
          id: 'get-asset',
          method: 'getAsset',
          params: { id: mint },
        },
        { timeout: 5000 }
      );

      const asset = response.data?.result;
      
      if (asset) {
        const nft: NFTHolding = {
          mint,
          name: asset.content?.metadata?.name || 'Unknown NFT',
          collection: asset.grouping?.[0]?.group_value,
          image: asset.content?.links?.image,
          attributes: this.parseAttributes(asset.content?.metadata?.attributes),
          verified: asset.grouping?.[0]?.verified || false,
        };
        
        this.nftCache.set(mint, nft);
        return nft;
      }
    } catch {
      // Helius not available, return basic info
    }

    return {
      mint,
      name: 'Unknown NFT',
      verified: false,
    };
  }

  private parseAttributes(attrs: any[]): Record<string, string> {
    const result: Record<string, string> = {};
    
    if (!Array.isArray(attrs)) return result;
    
    for (const attr of attrs) {
      if (attr.trait_type && attr.value) {
        result[attr.trait_type] = String(attr.value);
      }
    }
    
    return result;
  }
}
