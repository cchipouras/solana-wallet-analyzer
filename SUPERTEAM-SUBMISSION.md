# Superteam Bounty Submission Guide

## 📦 Project: Solana Wallet Analyzer

**GitHub Repo:** https://github.com/cchipouras/solana-wallet-analyzer

---

## Step 1: Access Superteam Earn

1. Go to **https://superteam.fun/earn/**
2. Click "Sign In" or "Connect Wallet" (Solana wallet like Phantom/Backpack)
3. Complete profile setup if prompted

---

## Step 2: Find Relevant Bounties

Look for bounties in these categories:
- **Developer Tools** - This project fits as a CLI developer tool
- **Solana Ecosystem** - Wallet analysis is core infrastructure
- **DeFi/Analytics** - Portfolio tracking functionality
- **Open Source** - MIT licensed project

Filter by:
- Skill: TypeScript, Solana, CLI
- Type: Bounty (not job)
- Status: Open

---

## Step 3: Prepare Your Submission

### Required Materials:
1. **GitHub Link:** https://github.com/cchipouras/solana-wallet-analyzer
2. **Demo Video:** Record a 2-3 minute demo showing:
   - Installation (`npm install -g solana-wallet-analyzer`)
   - Running `swa analyze <wallet>` on a known whale wallet
   - Token holdings view
   - Transaction history
   - Portfolio report generation

3. **Description Template:**
```
# Solana Wallet Analyzer

A comprehensive CLI tool for analyzing any Solana wallet.

## Features:
- 💰 Full wallet overview (SOL balance, total value, wallet age)
- 🪙 Token holdings with USD values and 24h changes
- 🖼️ NFT gallery with metadata
- 📊 Transaction history with filtering
- 📈 Portfolio analytics and risk metrics
- 🔗 DeFi position tracking
- 🏷️ Wallet labeling (exchanges, protocols)

## Tech Stack:
- TypeScript
- @solana/web3.js
- @metaplex-foundation/js
- Commander.js for CLI

## Links:
- GitHub: https://github.com/cchipouras/solana-wallet-analyzer
- npm: solana-wallet-analyzer (pending publish)
```

---

## Step 4: Submit

1. Click on the relevant bounty
2. Click "Submit" or "Apply"
3. Paste the GitHub link
4. Upload demo video (or provide Loom/YouTube link)
5. Fill in the description
6. Submit

---

## Step 5: Follow Up

- Monitor the bounty page for sponsor feedback
- Be ready to make changes if requested
- Engage with other participants in comments

---

## Claim Code (if using Agent API)

If submitting via Superteam Agent API:
- **Claim URL:** https://superteam.fun/earn/claim/A4476E697CAD034CAAD51CA7
- **Agent ID:** b53b4c14-df41-4bca-86a4-c92e16050225

---

## Tips for Winning

1. **Polish the README** - First impressions matter
2. **Add tests** - Shows production-ready code
3. **Record a quality demo** - Show real-world usage
4. **Engage with sponsors** - Ask clarifying questions
5. **Publish to npm** - Makes it easy to try (`npm i -g solana-wallet-analyzer`)

---

## Quick Commands to Test Before Submission

```bash
# Install dependencies
cd solana-wallet-analyzer
npm install

# Build
npm run build

# Test on a known wallet
node dist/index.js analyze 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

---

**Good luck! 🚀**
