#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

import { WalletAnalyzer } from './analyzer';
import {
  printWalletOverview,
  printTokenTable,
  printNFTTable,
  printTransactionTable,
  toJson,
  toCsv,
  formatCurrency,
} from './utils/format';

// Load environment variables
dotenv.config();

const program = new Command();

// Get RPC URL from env or use default
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

program
  .name('solana-analyzer')
  .description('Comprehensive CLI tool for analyzing Solana wallets')
  .version('1.0.0');

// Analyze command
program
  .command('analyze <address>')
  .description('Get a comprehensive overview of a Solana wallet')
  .option('-o, --output <file>', 'Output to file')
  .option('-f, --format <format>', 'Output format (table, json)', 'table')
  .action(async (address: string, options) => {
    const spinner = ora('Analyzing wallet...').start();
    
    try {
      const analyzer = new WalletAnalyzer({ rpcUrl: RPC_URL });
      
      if (!analyzer.isValidAddress(address)) {
        spinner.fail('Invalid Solana address');
        process.exit(1);
      }

      const analysis = await analyzer.analyze(address);
      spinner.succeed('Analysis complete');

      if (options.format === 'json') {
        const output = toJson(analysis);
        if (options.output) {
          fs.writeFileSync(options.output, output);
          console.log(chalk.green(`✓ Saved to ${options.output}`));
        } else {
          console.log(output);
        }
      } else {
        printWalletOverview(analysis);
        
        if (analysis.tokens.length > 0) {
          printTokenTable(analysis.tokens);
        }
        
        if (analysis.nfts.length > 0) {
          printNFTTable(analysis.nfts);
        }
      }
    } catch (error: any) {
      spinner.fail(`Analysis failed: ${error.message}`);
      process.exit(1);
    }
  });

// Tokens command
program
  .command('tokens <address>')
  .description('List all SPL token holdings')
  .option('-s, --sort <field>', 'Sort by field (value, amount, name)', 'value')
  .option('-m, --min-value <value>', 'Minimum value to show', '0')
  .option('-f, --format <format>', 'Output format (table, json, csv)', 'table')
  .option('-o, --output <file>', 'Output to file')
  .action(async (address: string, options) => {
    const spinner = ora('Fetching tokens...').start();
    
    try {
      const analyzer = new WalletAnalyzer({ rpcUrl: RPC_URL });
      let tokens = await analyzer.getTokens(address);
      
      // Filter by min value
      const minValue = parseFloat(options.minValue);
      tokens = tokens.filter(t => t.valueUsd >= minValue);
      
      // Sort
      if (options.sort === 'amount') {
        tokens.sort((a, b) => b.uiAmount - a.uiAmount);
      } else if (options.sort === 'name') {
        tokens.sort((a, b) => a.symbol.localeCompare(b.symbol));
      }

      spinner.succeed(`Found ${tokens.length} tokens`);

      let output: string;
      
      if (options.format === 'json') {
        output = toJson(tokens);
      } else if (options.format === 'csv') {
        output = toCsv(tokens);
      } else {
        printTokenTable(tokens);
        
        const totalValue = tokens.reduce((s, t) => s + t.valueUsd, 0);
        console.log(chalk.bold(`\nTotal Token Value: ${chalk.green(formatCurrency(totalValue))}`));
        return;
      }

      if (options.output) {
        fs.writeFileSync(options.output, output);
        console.log(chalk.green(`✓ Saved to ${options.output}`));
      } else {
        console.log(output);
      }
    } catch (error: any) {
      spinner.fail(`Failed: ${error.message}`);
      process.exit(1);
    }
  });

// NFTs command
program
  .command('nfts <address>')
  .description('View NFT holdings')
  .option('-c, --collection <name>', 'Filter by collection')
  .option('-v, --verified-only', 'Only show verified NFTs')
  .option('-f, --format <format>', 'Output format (table, json)', 'table')
  .action(async (address: string, options) => {
    const spinner = ora('Fetching NFTs...').start();
    
    try {
      const analyzer = new WalletAnalyzer({ rpcUrl: RPC_URL });
      let nfts = await analyzer.getNFTs(address);
      
      if (options.verifiedOnly) {
        nfts = nfts.filter(n => n.verified);
      }
      
      if (options.collection) {
        nfts = nfts.filter(n => 
          n.collection?.toLowerCase().includes(options.collection.toLowerCase())
        );
      }

      spinner.succeed(`Found ${nfts.length} NFTs`);

      if (options.format === 'json') {
        console.log(toJson(nfts));
      } else {
        if (nfts.length === 0) {
          console.log(chalk.yellow('\nNo NFTs found in this wallet'));
        } else {
          printNFTTable(nfts);
        }
      }
    } catch (error: any) {
      spinner.fail(`Failed: ${error.message}`);
      process.exit(1);
    }
  });

// Transactions command
program
  .command('txs <address>')
  .description('View transaction history')
  .option('-l, --limit <number>', 'Number of transactions', '20')
  .option('-t, --type <type>', 'Filter by type (swap, transfer, stake)')
  .option('--after <date>', 'Only show transactions after date')
  .option('-f, --format <format>', 'Output format (table, json)', 'table')
  .action(async (address: string, options) => {
    const spinner = ora('Fetching transactions...').start();
    
    try {
      const analyzer = new WalletAnalyzer({ rpcUrl: RPC_URL });
      let transactions = await analyzer.getTransactions(address, parseInt(options.limit));
      
      if (options.type) {
        transactions = transactions.filter(t => t.type === options.type);
      }
      
      if (options.after) {
        const afterDate = new Date(options.after).getTime() / 1000;
        transactions = transactions.filter(t => t.blockTime > afterDate);
      }

      spinner.succeed(`Found ${transactions.length} transactions`);

      if (options.format === 'json') {
        console.log(toJson(transactions));
      } else {
        printTransactionTable(transactions);
      }
    } catch (error: any) {
      spinner.fail(`Failed: ${error.message}`);
      process.exit(1);
    }
  });

// Report command
program
  .command('report <address>')
  .description('Generate a full portfolio report')
  .option('-o, --output <file>', 'Output file', 'report.json')
  .option('-f, --format <format>', 'Output format (json, html)', 'json')
  .action(async (address: string, options) => {
    const spinner = ora('Generating report...').start();
    
    try {
      const analyzer = new WalletAnalyzer({ rpcUrl: RPC_URL });
      
      spinner.text = 'Analyzing wallet...';
      const analysis = await analyzer.analyze(address);
      
      spinner.text = 'Calculating metrics...';
      const metrics = await analyzer.getPortfolioMetrics(analysis);
      
      spinner.text = 'Fetching transaction history...';
      const transactions = await analyzer.getTransactions(address, 100);

      const report = {
        generatedAt: new Date().toISOString(),
        address,
        overview: {
          solBalance: analysis.solBalance,
          solValueUsd: analysis.solValueUsd,
          totalValueUsd: analysis.totalValueUsd,
          walletAge: analysis.walletAge,
          transactionCount: analysis.transactionCount,
          labels: analysis.labels,
          riskScore: analysis.riskScore,
        },
        metrics,
        tokens: analysis.tokens,
        nfts: analysis.nfts,
        recentTransactions: transactions.slice(0, 20),
      };

      const output = options.format === 'html' 
        ? generateHtmlReport(report)
        : toJson(report);

      fs.writeFileSync(options.output, output);
      spinner.succeed(`Report saved to ${options.output}`);

      // Print summary
      console.log(chalk.bold('\n📊 Portfolio Summary'));
      console.log(`   Total Value: ${chalk.green(formatCurrency(analysis.totalValueUsd))}`);
      console.log(`   Diversification: ${chalk.blue(metrics.diversificationScore.toFixed(0) + '/100')}`);
      console.log(`   Risk Level: ${chalk.yellow(metrics.riskLevel)}`);
      console.log(`   Top Holding: ${chalk.cyan(metrics.topHoldings[0]?.name)} (${metrics.topHoldings[0]?.percentage.toFixed(1)}%)`);
    } catch (error: any) {
      spinner.fail(`Failed: ${error.message}`);
      process.exit(1);
    }
  });

// Balance command (quick check)
program
  .command('balance <address>')
  .description('Quick SOL balance check')
  .action(async (address: string) => {
    try {
      const analyzer = new WalletAnalyzer({ rpcUrl: RPC_URL });
      const analysis = await analyzer.analyze(address);
      
      console.log(chalk.bold('\n💰 Wallet Balance'));
      console.log(`   Address: ${chalk.gray(address)}`);
      console.log(`   SOL: ${chalk.yellow(analysis.solBalance.toFixed(4))} (${chalk.green(formatCurrency(analysis.solValueUsd))})`);
      console.log(`   Tokens: ${chalk.green(formatCurrency(analysis.tokens.reduce((s, t) => s + t.valueUsd, 0)))}`);
      console.log(`   Total: ${chalk.bold.green(formatCurrency(analysis.totalValueUsd))}\n`);
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

function generateHtmlReport(report: any): string {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Solana Wallet Report - ${report.address}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #0f0f0f; color: #fff; }
    h1 { color: #9945FF; }
    .card { background: #1a1a1a; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .metric { font-size: 24px; color: #14F195; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #333; }
    th { color: #9945FF; }
  </style>
</head>
<body>
  <h1>🔍 Solana Wallet Analysis</h1>
  <p>Address: <code>${report.address}</code></p>
  <p>Generated: ${report.generatedAt}</p>
  
  <div class="card">
    <h2>Overview</h2>
    <p>Total Value: <span class="metric">$${report.overview.totalValueUsd.toFixed(2)}</span></p>
    <p>SOL Balance: ${report.overview.solBalance.toFixed(4)} SOL</p>
    <p>Wallet Age: ${report.overview.walletAge} days</p>
    <p>Risk Score: ${report.overview.riskScore}/100</p>
  </div>
  
  <div class="card">
    <h2>Token Holdings</h2>
    <table>
      <tr><th>Token</th><th>Amount</th><th>Value</th></tr>
      ${report.tokens.map((t: any) => `<tr><td>${t.symbol}</td><td>${t.uiAmount.toFixed(4)}</td><td>$${t.valueUsd.toFixed(2)}</td></tr>`).join('')}
    </table>
  </div>
</body>
</html>`;
}

// Parse and run
program.parse();
