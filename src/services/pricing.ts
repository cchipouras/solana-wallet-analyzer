import axios from 'axios';
import { PriceData, TokenHolding } from '../types';

export class PricingService {
  private cache: Map<string, { price: PriceData; timestamp: number }> = new Map();
  private cacheTtl: number = 60000; // 1 minute
  private jupiterApiUrl = 'https://price.jup.ag/v6/price';
  private coingeckoApiUrl = 'https://api.coingecko.com/api/v3';

  async getSolPrice(): Promise<number> {
    try {
      const cached = this.cache.get('SOL');
      if (cached && Date.now() - cached.timestamp < this.cacheTtl) {
        return cached.price.priceUsd;
      }

      // Try Jupiter first
      const response = await axios.get(`${this.jupiterApiUrl}?ids=So11111111111111111111111111111111111111112`);
      const price = response.data?.data?.So11111111111111111111111111111111111111112?.price || 0;
      
      this.cache.set('SOL', {
        price: { symbol: 'SOL', priceUsd: price, change24h: 0 },
        timestamp: Date.now(),
      });

      return price;
    } catch (error) {
      console.error('Failed to fetch SOL price:', error);
      return 120; // Fallback
    }
  }

  async getTokenPrices(mints: string[]): Promise<Map<string, PriceData>> {
    const prices = new Map<string, PriceData>();
    
    if (mints.length === 0) return prices;

    try {
      // Batch fetch from Jupiter
      const ids = mints.join(',');
      const response = await axios.get(`${this.jupiterApiUrl}?ids=${ids}`);
      
      for (const [mint, data] of Object.entries(response.data?.data || {})) {
        const priceData = data as any;
        prices.set(mint, {
          symbol: priceData.symbol || '',
          priceUsd: priceData.price || 0,
          change24h: 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch token prices:', error);
    }

    return prices;
  }

  async enrichTokensWithPrices(tokens: TokenHolding[]): Promise<TokenHolding[]> {
    const mints = tokens.map(t => t.mint);
    const prices = await this.getTokenPrices(mints);

    return tokens.map(token => {
      const priceData = prices.get(token.mint);
      if (priceData) {
        return {
          ...token,
          priceUsd: priceData.priceUsd,
          valueUsd: token.uiAmount * priceData.priceUsd,
          change24h: priceData.change24h,
        };
      }
      return token;
    });
  }

  async getHistoricalPrice(mint: string, date: Date): Promise<number | null> {
    // For historical prices, we'd need CoinGecko Pro or similar
    // This is a placeholder
    return null;
  }
}
