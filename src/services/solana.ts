import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  ParsedAccountData,
  ConfirmedSignatureInfo,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { TokenHolding, Transaction, TransactionType } from '../types';

export class SolanaService {
  private connection: Connection;

  constructor(rpcUrl: string = 'https://api.mainnet-beta.solana.com') {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  async getSolBalance(address: string): Promise<number> {
    const pubkey = new PublicKey(address);
    const balance = await this.connection.getBalance(pubkey);
    return balance / LAMPORTS_PER_SOL;
  }

  async getTokenAccounts(address: string): Promise<TokenHolding[]> {
    const pubkey = new PublicKey(address);
    
    const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
      pubkey,
      { programId: TOKEN_PROGRAM_ID }
    );

    const holdings: TokenHolding[] = [];

    for (const { account } of tokenAccounts.value) {
      const data = account.data as ParsedAccountData;
      const info = data.parsed?.info;
      
      if (!info || info.tokenAmount.uiAmount === 0) continue;

      holdings.push({
        mint: info.mint,
        symbol: '', // Will be enriched by metadata service
        name: '',
        amount: parseInt(info.tokenAmount.amount),
        decimals: info.tokenAmount.decimals,
        uiAmount: info.tokenAmount.uiAmount,
        priceUsd: 0,
        valueUsd: 0,
        change24h: 0,
      });
    }

    return holdings;
  }

  async getTransactionHistory(
    address: string,
    limit: number = 100
  ): Promise<ConfirmedSignatureInfo[]> {
    const pubkey = new PublicKey(address);
    
    const signatures = await this.connection.getSignaturesForAddress(pubkey, {
      limit,
    });

    return signatures;
  }

  async getTransactionDetails(signature: string): Promise<Transaction | null> {
    const tx = await this.connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) return null;

    const type = this.classifyTransaction(tx);
    
    return {
      signature,
      blockTime: tx.blockTime || 0,
      slot: tx.slot,
      type,
      status: tx.meta?.err ? 'failed' : 'success',
      fee: (tx.meta?.fee || 0) / LAMPORTS_PER_SOL,
      description: this.getTransactionDescription(tx, type),
    };
  }

  private classifyTransaction(tx: any): TransactionType {
    const instructions = tx.transaction?.message?.instructions || [];
    
    for (const ix of instructions) {
      const programId = ix.programId?.toString() || '';
      
      // Jupiter/Raydium swaps
      if (programId.includes('JUP') || programId.includes('675k')) {
        return 'swap';
      }
      
      // Stake program
      if (programId === 'Stake11111111111111111111111111111111111111') {
        return 'stake';
      }
      
      // Metaplex
      if (programId.includes('metaq') || programId.includes('M2mx')) {
        if (tx.meta?.postTokenBalances?.length) {
          return 'nft-transfer';
        }
        return 'nft-mint';
      }
      
      // Token transfers
      if (programId === TOKEN_PROGRAM_ID.toString()) {
        return 'transfer';
      }
    }

    return 'unknown';
  }

  private getTransactionDescription(tx: any, type: TransactionType): string {
    switch (type) {
      case 'swap':
        return 'Token swap';
      case 'stake':
        return 'Staking operation';
      case 'transfer':
        return 'Token transfer';
      case 'nft-mint':
        return 'NFT minted';
      case 'nft-transfer':
        return 'NFT transferred';
      default:
        return 'Transaction';
    }
  }

  async getAccountAge(address: string): Promise<number> {
    const pubkey = new PublicKey(address);
    
    // Get the oldest transaction
    const signatures = await this.connection.getSignaturesForAddress(pubkey, {
      limit: 1000,
    });

    if (signatures.length === 0) return 0;

    // Get the oldest one
    const oldest = signatures[signatures.length - 1];
    
    if (!oldest.blockTime) return 0;

    const ageMs = Date.now() - oldest.blockTime * 1000;
    return Math.floor(ageMs / (1000 * 60 * 60 * 24)); // Days
  }

  async getSlot(): Promise<number> {
    return this.connection.getSlot();
  }

  isValidAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }
}
