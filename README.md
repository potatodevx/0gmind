# 0GMind — Portable AI Memory on 0G

> **Portable AI memory. One blob ID. Any agent. Forever.**

0GMind is a protocol that gives every AI agent a portable, encrypted memory stored on 0G decentralized infrastructure. Pass a single blob ID between any models, companies, or agents — and they instantly inherit the full context.

Built for the [Zero Cup 2026](https://0g.ai/arena/zero-cup) — 0G's global vibe coding tournament.

---

## The Problem

Every AI agent you use has amnesia by design:
- You spend hours building context with Claude → switch to GPT → starts from zero
- Company A's AI knows a customer deeply → hands work to Company B → knows nothing
- A model gets deprecated → all accumulated context is gone forever

**0GMind fixes this.** One blob ID. Any agent. Permanent.

---

## How It Works

```
Agent A finishes session
        ↓
  store_context(data)  
        ↓
0G Compute (Sealed Inference) encrypts context
        ↓  
0G Storage stores encrypted blob → returns context_id (blob ID)
        ↓
context_id minted as NFT on 0G Chain (you own it)
        ↓
────── share context_id ──────
        ↓
Agent B receives context_id
        ↓
0G Storage fetches + 0G Compute decrypts inside TEE
        ↓
Agent B has Agent A's complete memory
```

---

## 0G Stack — All 4 Layers

| Layer | Role | Why It's Core |
|-------|------|---------------|
| **0G Storage** | Encrypted context blob storage | The entire product. Remove it and nothing works. |
| **0G Compute (Sealed Inference)** | TEE-encrypted context processing | Privacy guarantee. No one reads your data — not even 0G. |
| **0G Chain** | Context ownership as ERC-721 NFTs | Transfer, revoke, license access on-chain. |
| **0G DA** | Access audit trail | Every read logged permanently. |

---

## Features

- **Store** any AI conversation/context as an encrypted blob on 0G Storage
- **Load** context into any AI model using just the blob ID
- **Own** your context as an NFT on 0G Chain — transfer, revoke anytime
- **Share** specific access without giving up ownership
- **Chat** using loaded context via 0G Compute inference
- **Marketplace** — browse and load public contexts
- **Privacy** — Sealed Inference ensures nobody reads private data

---

## Tech Stack

**Frontend:**
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- viem — 0G Chain interactions

**Backend:**
- Express.js + TypeScript
- ethers.js — 0G Chain + Storage
- OpenAI-compatible SDK — 0G Compute API
- axios — 0G Storage Indexer API

**Contracts:**
- Solidity ^0.8.20
- `ContextRegistry.sol` — ERC-721 for context ownership

**0G Network:**
- 0G Galileo Testnet (Chain ID: 16601)
- 0G Storage (Flow contract)
- 0G Compute (Sealed Inference)

---

## Project Structure

```
0gmind/                        # Frontend
├── app/
│   ├── page.tsx                   # Home — hero + features
│   ├── store/page.tsx             # Store context
│   ├── load/page.tsx              # Load context by ID
│   ├── dashboard/page.tsx         # All stored contexts
│   └── marketplace/page.tsx       # Browse public contexts
├── components/
│   ├── ui/Navbar.tsx
│   └── chain/config.ts            # 0G chain + contract config
├── contracts/
│   └── ContextRegistry.sol        # ERC-721 context ownership
├── .env.example
└── REQUIREMENTS.md                # Deployment checklist

0gmind_backend/                # Backend
├── src/
│   ├── index.ts                   # Express server
│   ├── routes/context.ts          # API routes
│   ├── services/
│   │   ├── storageService.ts      # 0G Storage integration
│   │   └── computeService.ts      # 0G Compute integration
│   └── types/index.ts
└── .env.example
```

---

## Running Locally

### Prerequisites
- Node.js 18+
- A funded wallet on 0G Galileo Testnet

### Backend
```bash
cd 0gmind_backend
cp .env.example .env
# Fill in your keys
npm install
npm run dev
# Runs on http://localhost:3001
```

### Frontend
```bash
cd 0gmind
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:3001
npm install
npm run dev
# Runs on http://localhost:3000
```

### Deploy Contract
1. Open `contracts/ContextRegistry.sol` in [Remix](https://remix.ethereum.org)
2. Compile Solidity 0.8.20+
3. Deploy to 0G Galileo (Chain ID: 16601, RPC: `https://evmrpc-testnet.0g.ai`)
4. Copy address → set `NEXT_PUBLIC_CONTEXT_REGISTRY_ADDRESS` in `.env.local`

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/context/store` | POST | Store context to 0G Storage |
| `/api/context/load` | POST | Load context by blob ID |
| `/api/context/list` | GET | List public contexts |
| `/api/context/chat` | POST | Chat using loaded context (0G Compute) |
| `/api/context/:id/metadata` | GET | Get context metadata |
| `/api/context/stats` | GET | Network stats |

---

## 0G Network Details

| Property | Value |
|----------|-------|
| Network | 0G Galileo Testnet |
| Chain ID | 16601 |
| RPC | https://evmrpc-testnet.0g.ai |
| Explorer | https://chainscan-galileo.0g.ai |
| Faucet | https://faucet.0g.ai |

---

## Zero Cup 2026

Built for the [Zero Cup](https://0g.ai/arena/zero-cup) — 0G's global vibe coding tournament.

**Why 0GMind uses 0G:**
- 0G Storage: 2 GB/s throughput — the only decentralized storage fast enough for real-time AI context
- 0G Compute with Sealed Inference: Only platform where AI processes data inside a TEE with cryptographic proof
- 0G Chain: Sub-second finality for instant ownership transfers
- 0G DA: 50,000x faster than Ethereum DA for audit trail logging

This product cannot run on any other chain. 0G is not a bolt-on — it is the product.
