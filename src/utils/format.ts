import chalk from 'chalk';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Table from 'cli-table3';
import { WalletAnalysis, TokenHolding, Transaction, NFTHolding } from '../types';

dayjs.extend(relativeTime);

export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

export function formatNumber(value: number, decimals: number = 2): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(decimals)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(decimals)}K`;
  }
  return value.toFixed(decimals);
}

export function formatAddress(address: string, length: number = 8): string {
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

export function formatChange(change: number): string {
  if (change > 0) {
    return chalk.green(`+${change.toFixed(2)}%`);
  } else if (change < 0) {
    return chalk.red(`${change.toFixed(2)}%`);
  }
  return chalk.gray('0.00%');
}

export function formatTime(timestamp: number): string {
  return dayjs(timestamp * 1000).fromNow();
}

export function formatDate(timestamp: number): string {
  return dayjs(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss');
}

export function printWalletOverview(analysis: WalletAnalysis): void {
  const border = '═'.repeat(58);
  
  console.log(chalk.cyan(`╔${border}╗`));
  console.log(chalk.cyan('║') + chalk.bold.white('  Solana Wallet Analyzer                                  ') + chalk.cyan('║'));
  console.log(chalk.cyan('║') + chalk.gray(`  Address: ${formatAddress(analysis.address, 12)}                        `) + chalk.cyan('║'));
  console.log(chalk.cyan(`╠${border}╣`));
  
  console.log(chalk.cyan('║') + `  SOL Balance: ${chalk.yellow(formatNumber(analysis.solBalance) + ' SOL')} (${chalk.green(formatCurrency(analysis.solValueUsd))})`.padEnd(67) + chalk.cyan('║'));
  console.log(chalk.cyan('║') + `  Token Value: ${chalk.green(formatCurrency(analysis.tokens.reduce((sum, t) => sum + t.valueUsd, 0)))}`.padEnd(67) + chalk.cyan('║'));
  console.log(chalk.cyan('║') + `  NFT Count: ${chalk.magenta(analysis.nfts.length.toString())}`.padEnd(67) + chalk.cyan('║'));
  console.log(chalk.cyan('║') + `  Total Value: ${chalk.bold.green(formatCurrency(analysis.totalValueUsd))}`.padEnd(67) + chalk.cyan('║'));
  console.log(chalk.cyan('║') + `  Wallet Age: ${chalk.blue(analysis.walletAge + ' days')}`.padEnd(67) + chalk.cyan('║'));
  console.log(chalk.cyan('║') + `  Total Transactions: ${chalk.white(formatNumber(analysis.transactionCount, 0))}`.padEnd(67) + chalk.cyan('║'));
  
  if (analysis.labels.length > 0) {
    console.log(chalk.cyan('║') + `  Labels: ${chalk.yellow(analysis.labels.join(', '))}`.padEnd(67) + chalk.cyan('║'));
  }
  
  console.log(chalk.cyan(`╚${border}╝`));
}

export function printTokenTable(tokens: TokenHolding[]): void {
  const table = new Table({
    head: [
      chalk.white('Token'),
      chalk.white('Amount'),
      chalk.white('Price'),
      chalk.white('Value'),
      chalk.white('24h'),
    ],
    colWidths: [15, 18, 12, 15, 10],
    style: { head: [], border: ['cyan'] },
  });

  // Sort by value descending
  const sorted = [...tokens].sort((a, b) => b.valueUsd - a.valueUsd);

  for (const token of sorted.slice(0, 20)) {
    table.push([
      chalk.yellow(token.symbol || formatAddress(token.mint, 4)),
      formatNumber(token.uiAmount),
      formatCurrency(token.priceUsd),
      chalk.green(formatCurrency(token.valueUsd)),
      formatChange(token.change24h),
    ]);
  }

  console.log(chalk.bold('\n📊 Token Holdings\n'));
  console.log(table.toString());
  
  if (tokens.length > 20) {
    console.log(chalk.gray(`\n  ... and ${tokens.length - 20} more tokens`));
  }
}

export function printNFTTable(nfts: NFTHolding[]): void {
  const table = new Table({
    head: [
      chalk.white('Name'),
      chalk.white('Collection'),
      chalk.white('Verified'),
    ],
    colWidths: [25, 25, 10],
    style: { head: [], border: ['magenta'] },
  });

  for (const nft of nfts.slice(0, 20)) {
    table.push([
      chalk.yellow(nft.name.slice(0, 22)),
      chalk.blue(nft.collection?.slice(0, 22) || '-'),
      nft.verified ? chalk.green('✓') : chalk.gray('-'),
    ]);
  }

  console.log(chalk.bold('\n🖼️  NFT Holdings\n'));
  console.log(table.toString());
  
  if (nfts.length > 20) {
    console.log(chalk.gray(`\n  ... and ${nfts.length - 20} more NFTs`));
  }
}

export function printTransactionTable(transactions: Transaction[]): void {
  const table = new Table({
    head: [
      chalk.white('Time'),
      chalk.white('Type'),
      chalk.white('Status'),
      chalk.white('Fee'),
      chalk.white('Signature'),
    ],
    colWidths: [15, 12, 10, 12, 20],
    style: { head: [], border: ['blue'] },
  });

  for (const tx of transactions) {
    table.push([
      formatTime(tx.blockTime),
      chalk.cyan(tx.type),
      tx.status === 'success' ? chalk.green('✓') : chalk.red('✗'),
      `${tx.fee.toFixed(6)} SOL`,
      formatAddress(tx.signature, 6),
    ]);
  }

  console.log(chalk.bold('\n📜 Recent Transactions\n'));
  console.log(table.toString());
}

export function toJson(data: any): string {
  return JSON.stringify(data, null, 2);
}

export function toCsv(tokens: TokenHolding[]): string {
  const headers = ['Symbol', 'Name', 'Amount', 'Price USD', 'Value USD', 'Mint'];
  const rows = tokens.map(t => [
    t.symbol,
    t.name,
    t.uiAmount.toString(),
    t.priceUsd.toString(),
    t.valueUsd.toString(),
    t.mint,
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
