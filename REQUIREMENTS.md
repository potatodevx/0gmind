# 0GMind — Requirements & Deployment Checklist

## What You Need Before Deploying

### 1. Wallets
- A wallet with 0G testnet tokens (OG) for:
  - Deploying `ContextRegistry.sol` (gas)
  - Backend wallet for 0G Storage submissions
- Get testnet OG: https://faucet.0g.ai

### 2. Services Required
| Service | Plan | Cost | Notes |
|---------|------|------|-------|
| Railway | Starter ($5/mo) | $5 | Backend Express server |
| Vercel | Free | $0 | Frontend Next.js |
| 0G Galileo Testnet | Free | $0 | Blockchain + Storage |

> **Railway $5 is enough.** The backend is a lightweight Express server. 512MB RAM is sufficient.

### 3. 0G API Keys
- **0G Compute API key**: Get from https://0g.ai/compute → API Keys
  - Used for: AI summarization, context processing
  - Without it: Falls back to extractive summaries (still works)
- **0G Storage private key**: A funded wallet for submitting blobs
  - Without it: Returns deterministic hash (demo mode)

### 4. Smart Contract Deployment
Deploy `contracts/ContextRegistry.sol` on 0G Galileo Testnet:

1. Open https://remix.ethereum.org
2. Create new file → paste `ContextRegistry.sol` contents
3. Compile with Solidity 0.8.20+
4. In Deploy & Run:
   - Environment: Injected Provider (MetaMask)
   - Network: 0G Galileo (Chain ID: 16601)
   - RPC: https://evmrpc-testnet.0g.ai
5. Deploy → copy the contract address
6. Set `NEXT_PUBLIC_CONTEXT_REGISTRY_ADDRESS` in frontend `.env.local`

### 5. Environment Variables

**Frontend** (`0gmind/.env.local`):
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_ZERO_G_RPC=https://evmrpc-testnet.0g.ai
NEXT_PUBLIC_CHAIN_ID=16601
NEXT_PUBLIC_CONTEXT_REGISTRY_ADDRESS=0xYourContract
NEXT_PUBLIC_EXPLORER_URL=https://chainscan-galileo.0g.ai
```

**Backend** (`0gmind_backend/.env`):
```
PORT=3001
FRONTEND_URL=https://your-frontend.vercel.app
ZERO_G_RPC=https://evmrpc-testnet.0g.ai
ZERO_G_STORAGE_INDEXER=https://indexer-storage-testnet-standard.0g.ai
FLOW_CONTRACT=0x22E03a6A89B950F1c82ec5e74F8eCa321a105296
BACKEND_PRIVATE_KEY=your_wallet_private_key
ZERO_G_COMPUTE_BASE_URL=https://api.0g.ai/v1
ZERO_G_COMPUTE_API_KEY=your_0g_compute_api_key
ZERO_G_COMPUTE_MODEL=glm-4
```

## Deployment Steps

### Backend (Railway)
1. Go to https://railway.app → New Project → Deploy from GitHub
2. Select `0gmind_backend` repo
3. Add environment variables from above
4. Railway auto-detects Node.js and runs `npm start`
5. Copy the Railway URL → set as `NEXT_PUBLIC_API_URL` in frontend

### Frontend (Vercel)
1. Go to https://vercel.com → New Project → Import `0gmind` repo
2. Add environment variables
3. Deploy

## 0G Network Details
| Property | Value |
|----------|-------|
| Network | 0G Galileo Testnet |
| Chain ID | 16601 |
| RPC | https://evmrpc-testnet.0g.ai |
| Explorer | https://chainscan-galileo.0g.ai |
| Faucet | https://faucet.0g.ai |
| Storage Indexer | https://indexer-storage-testnet-standard.0g.ai |
| Flow Contract | 0x22E03a6A89B950F1c82ec5e74F8eCa321a105296 |
