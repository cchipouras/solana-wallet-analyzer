# Solana Wallet Analyzer 🔍

A comprehensive CLI tool for analyzing Solana wallets. View holdings, transactions, NFTs, DeFi positions, and portfolio analytics with a beautiful terminal interface.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![Solana](https://img.shields.io/badge/solana-mainnet--beta-purple.svg)

## Features

- 💰 **Wallet Overview** - SOL balance, total value, and wallet age
- 🪙 **Token Holdings** - All SPL tokens with USD values and 24h changes
- 🖼️ **NFT Gallery** - View NFT collections with metadata
- 📊 **Transaction History** - Detailed tx history with filtering
- 📈 **Portfolio Analytics** - Diversification metrics and risk analysis
- 🔗 **DeFi Positions** - Track staking, lending, and LP positions
- 🏷️ **Wallet Labeling** - Identify known wallets (exchanges, protocols)
- ⚡ **Fast & Efficient** - Parallel RPC calls with caching

## Installation

```bash
# Using npm
npm install -g solana-wallet-analyzer

# Using yarn
yarn global add solana-wallet-analyzer

# Or run directly with npx
npx solana-wallet-analyzer <wallet-address>
```

## Quick Start

```bash
# Analyze a wallet
swa analyze <wallet-address>

# View token holdings
swa tokens <wallet-address>

# Check NFTs
swa nfts <wallet-address>

# Transaction history
swa txs <wallet-address> --limit 50

# Full portfolio report
swa report <wallet-address> --output report.json
```

## Commands

### `analyze <address>`
Get a comprehensive overview of any Solana wallet.

```bash
swa analyze 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU

# Output:
# ╭──────────────────────────────────────────────────────────╮
# │  Solana Wallet Analyzer                                  │
# │  Address: 7xKXtg...AsU                                   │
# ├──────────────────────────────────────────────────────────┤
# │  SOL Balance: 1,234.56 SOL ($148,147.20)                │
# │  Token Value: $52,341.89                                 │
# │  NFT Count: 47                                           │
# │  Total Value: $200,489.09                                │
# │  Wallet Age: 847 days                                    │
# │  Total Transactions: 12,456                              │
# ╰──────────────────────────────────────────────────────────╯
```

### `tokens <address>`
List all SPL token holdings with values.

```bash
swa tokens <address> [--sort value|amount|name] [--min-value 1]
```

### `nfts <address>`
View NFT holdings with collection info.

```bash
swa nfts <address> [--collection <name>] [--verified-only]
```

### `txs <address>`
Transaction history with filters.

```bash
swa txs <address> [--limit 100] [--type swap|transfer|stake] [--after 2024-01-01]
```

### `report <address>`
Generate a full portfolio report.

```bash
swa report <address> --output report.json --format json|csv|html
```

### `watch <address>`
Real-time wallet monitoring.

```bash
swa watch <address> [--alert-threshold 1000]
```

## Configuration

Create a `.env` file or set environment variables:

```bash
# RPC endpoint (default: mainnet-beta)
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Alternative RPC providers (recommended for production)
# SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY
# SOLANA_RPC_URL=https://rpc.helius.xyz/?api-key=YOUR_KEY

# Price API (optional, for accurate pricing)
COINGECKO_API_KEY=your_key

# Cache settings
CACHE_TTL=300
```

## API Usage

You can also use this as a library:

```typescript
import { WalletAnalyzer } from 'solana-wallet-analyzer';

const analyzer = new WalletAnalyzer({
  rpcUrl: 'https://api.mainnet-beta.solana.com'
});

// Get full analysis
const analysis = await analyzer.analyze('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');

console.log(analysis.solBalance);
console.log(analysis.tokens);
console.log(analysis.nfts);
console.log(analysis.transactions);
```

## Examples

### Whale Watching
```bash
# Find wallets holding > 10000 SOL
swa analyze FxteHmLwG9nk1eL2pjWz8XUZLC2gDzKpMrEDiJBg6pvR
```

### Portfolio Tracking
```bash
# Export holdings to CSV
swa tokens <address> --format csv > portfolio.csv
```

### Transaction Monitoring
```bash
# Watch for large transactions
swa watch <address> --alert-threshold 10000
```

## Architecture

```
solana-wallet-analyzer/
├── src/
│   ├── index.ts          # CLI entry point
│   ├── analyzer.ts       # Core analysis engine
│   ├── commands/         # CLI commands
│   │   ├── analyze.ts
│   │   ├── tokens.ts
│   │   ├── nfts.ts
│   │   ├── transactions.ts
│   │   └── report.ts
│   ├── services/         # External integrations
│   │   ├── solana.ts     # Solana RPC wrapper
│   │   ├── pricing.ts    # Token price feeds
│   │   ├── metadata.ts   # NFT metadata
│   │   └── labels.ts     # Wallet labeling
│   ├── utils/            # Helpers
│   │   ├── format.ts
│   │   ├── cache.ts
│   │   └── logger.ts
│   └── types/            # TypeScript types
│       └── index.ts
├── tests/
├── package.json
├── tsconfig.json
└── README.md
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Solana Labs](https://solana.com) for the web3.js SDK
- [Metaplex](https://www.metaplex.com/) for NFT standards
- [Helius](https://helius.xyz) for enhanced RPC services
- [Jupiter](https://jup.ag) for DeFi data

---

Built with ❤️ for the Solana ecosystem
