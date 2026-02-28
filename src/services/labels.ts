import { WalletLabel } from '../types';

// Known wallet labels
const KNOWN_WALLETS: WalletLabel[] = [
  // Exchanges
  { address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', name: 'Binance Hot Wallet', type: 'exchange', verified: true },
  { address: '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9', name: 'Coinbase', type: 'exchange', verified: true },
  { address: 'ASTyfSima4LLAdDgoFGkgqoKowG1LZFDr9fAQrg7iaJZ', name: 'Kraken', type: 'exchange', verified: true },
  { address: '3yFwqXBfZY4jBVUafQ1YEXw189y2dN3V5KQq9uzBDy1E', name: 'FTX Estate', type: 'exchange', verified: true },
  
  // Protocols
  { address: '7oPa2PHQdZmjSPqvpZN7MQxnC7Dcf3uL7bLRQbRXWbZP', name: 'Raydium', type: 'protocol', verified: true },
  { address: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', name: 'Jupiter', type: 'protocol', verified: true },
  { address: 'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD', name: 'Marinade', type: 'protocol', verified: true },
  { address: 'MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA', name: 'Marginfi', type: 'protocol', verified: true },
  
  // DAOs
  { address: '7onfGtbJPrrVCVWnPqRZDJhH2hxK7xPURjgrLaHpBqy9', name: 'Mango DAO', type: 'dao', verified: true },
  
  // NFT Projects
  { address: 'SMBtHCCC6RYRutFEPb4gZqeBLUZbMNhRKaMKZZLHi7W', name: 'SMB Gen2', type: 'nft-project', verified: true },
  { address: 'DGNtHs6MSpCvS4P4aLvAx5CQ7qz8yKCR74FhLaQfvMPP', name: 'DeGods', type: 'nft-project', verified: true },
];

export class LabelService {
  private labels: Map<string, WalletLabel> = new Map();

  constructor() {
    // Initialize with known wallets
    for (const label of KNOWN_WALLETS) {
      this.labels.set(label.address, label);
    }
  }

  getLabel(address: string): WalletLabel | null {
    return this.labels.get(address) || null;
  }

  getLabels(address: string): string[] {
    const label = this.labels.get(address);
    if (!label) return [];
    
    const labels = [label.name];
    if (label.verified) labels.push('✓ Verified');
    labels.push(label.type);
    
    return labels;
  }

  isExchange(address: string): boolean {
    const label = this.labels.get(address);
    return label?.type === 'exchange';
  }

  isProtocol(address: string): boolean {
    const label = this.labels.get(address);
    return label?.type === 'protocol';
  }

  isKnown(address: string): boolean {
    return this.labels.has(address);
  }

  addLabel(label: WalletLabel): void {
    this.labels.set(label.address, label);
  }

  getAllLabels(): WalletLabel[] {
    return Array.from(this.labels.values());
  }
}
