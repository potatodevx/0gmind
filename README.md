# 0GMind — Portable AI Memory on 0G

> **One Blob ID. Any Agent. Forever.**

0GMind is a protocol that gives every AI agent a portable, encrypted, on-chain memory stored on 0G decentralized infrastructure. Pass a single blob ID between any models, companies, or agents and they instantly inherit the full context.

Built for [Zero Cup 2026](https://0g.ai/arena/zero-cup) — 0G's global vibe-coding tournament.

---

## The Problem

Every AI agent has amnesia by design:

- You spend hours building deep context with Claude → switch to GPT-4 → starts from zero.
- Company A's agent handles a customer → hands off to Company B → knows nothing.
- A model gets deprecated → all accumulated memory is gone forever.

**0GMind fixes this.** Memory becomes a portable asset, not a local file.

---

## How It Works — End to End

```
User pastes AI context (conversation / system prompt / agent memory)
                ↓
  [BACKEND] POST /api/context/store
                ↓
  ① Validate content (token count, size limits)
                ↓
  ② If private → encrypt with XOR key (key stored server-side)
                ↓
  ③ 0G Compute (GLM model via OpenAI-compatible API)
     → generates a 2–3 sentence AI summary for the preview
                ↓
  ④ 0G Storage Indexer (indexer-storage-testnet-standard.0g.ai)
     → upload encrypted blob → FLOW contract submit(dataRoot)
     → returns rootHash = the BLOB ID
                ↓
  [FRONTEND] mintContext(blobId, model, description, isPublic, size)
     → ContextRegistry.sol (ERC-721) on 0G Chain (Chain ID 16602)
     → NFT minted → you own the memory on-chain
                ↓
  ─────────────────── share the blob ID ─────────────────
                ↓
  [ANYONE] POST /api/context/load  { contextId: "0x3f9a..." }
                ↓
  ① Look up metadata (model, owner, encryption key)
                ↓
  ② 0G Storage → download encrypted blob
                ↓
  ③ If private → decrypt in-server
     (production design: decryption happens inside 0G TEE via Sealed Inference)
                ↓
  ④ Return plaintext context to caller
                ↓
  [ANYONE] POST /api/context/chat  { contextId, query }
     → context injected as system prompt into 0G Compute model
     → model responds as if it was always part of that session
```

---

## The 0G Stack — Why All 4 Layers Are Core

| Layer | What We Use It For | Remove It And… |
|---|---|---|
| **0G Storage** | Every context blob lives here. Encrypted, decentralized, permanent. 2 GB/s throughput means zero latency when loading memory into a live agent. | The entire product is gone. There is no memory without storage. |
| **0G Compute (Sealed Inference)** | AI runs inside a TEE (Trusted Execution Environment). (a) Generate a summary when storing. (b) Answer queries using the loaded context. Neither the operator nor anyone else can read plaintext data inside the enclave. | Privacy guarantee disappears. We become a regular API with a database. |
| **0G Chain** | `ContextRegistry.sol` ERC-721 mints a token for every stored context. Ownership, transfer, and access-grant live on-chain. | No provable ownership. Anyone could claim they own a context. |
| **0G DA** | Every `logAccess` call is permanently recorded as a DA blob. Full, tamper-proof audit trail of who loaded your memory and when. | No accountability. Enterprise customers won't touch a product without audit logs. |

---

## Pages & What Each One Does

### `/` — Home
The landing page with:
- Full-screen hero with a live 3D wireframe animation (Three.js icosahedron lattice).
- Two CTA buttons top-right: **Dashboard** and **Store Context**.
- "How It Works" 4-step card section.
- "Built on Every Layer" 0G Stack section with animated SVG icons.

### `/store` — Store Context
1. Connect MetaMask (required for NFT minting; storage works without it).
2. Paste any AI conversation, system prompt, or agent memory.
3. Choose the source AI model and a description.
4. Toggle **Public** (visible in marketplace) or **Private** (encrypted, TEE-only).
5. Click **Store on 0G + Mint NFT**:
   - Step 1 hits `POST /api/context/store` → uploads to 0G Storage → returns blob ID.
   - Step 2 calls `mintContext()` on-chain → mints the ERC-721 NFT.
6. You receive the blob ID and a link to the on-chain transaction.

### `/load` — Load Context
1. Paste a blob ID (or receive it as a URL query param `?id=0x...`).
2. Choose your target model (metadata only — tells the UI which model you intend to use).
3. Click **Load** → hits `POST /api/context/load` → fetches + decrypts from 0G Storage.
4. See a preview of the context and metadata (source model, privacy, timestamp).
5. Use the **Chat** box: `POST /api/context/chat` → 0G Compute answers your query using the stored context as the system prompt.

### `/dashboard` — Dashboard
- Connect wallet to see all NFTs owned by your address (`tokensOf(address)`).
- Stats: total on-chain contexts, your NFTs, public contexts, network name.
- **Grant Access** — enter any `0x` address → calls `grantAccess(tokenId, grantee)` on-chain so they can load a private context.
- Explorer links to every NFT and transaction on chainscan-galileo.

### `/marketplace` — Marketplace
- Browse all public contexts stored by anyone.
- Filter by source model (Claude, GPT-4o, Gemini, GLM, Llama, etc.).
- Search by description or summary.
- Click **Load Context →** to jump straight to `/load?id=...`.

---

## Backend API

Base URL: `http://localhost:3001`

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Health check |
| `/api/context/store` | POST | Encrypt + upload to 0G Storage. Returns blob ID. |
| `/api/context/load` | POST | Download + decrypt from 0G Storage by blob ID. |
| `/api/context/list` | GET | List all public contexts (sorted by newest). |
| `/api/context/chat` | POST | Inject loaded context into 0G Compute and answer a query. |
| `/api/context/:id/metadata` | GET | Get description, model, owner, access count for a context. |
| `/api/context/stats` | GET | Network-wide stats (total, public, private, total size, access count). |

### Store Request
```json
POST /api/context/store
{
  "content": "User: ... Assistant: ...",
  "modelName": "Claude Sonnet 4.5",
  "description": "Product planning session",
  "isPublic": false,
  "walletAddress": "0xabc..."
}
```

### Load Request
```json
POST /api/context/load
{
  "contextId": "0x3f9a4b..."
}
```

### Chat Request
```json
POST /api/context/chat
{
  "contextId": "0x3f9a4b...",
  "query": "What were the action items from our last session?"
}
```

---

## Smart Contract — ContextRegistry.sol

Deployed on 0G Galileo Testnet at:
```
0x958a498B4f1Bd1F197BC177F8398e656efD44422
```

### What It Does
An ERC-721 contract where each token = one AI context blob.

### Key Functions

```solidity
// Mint ownership of a stored context
function mintContext(
  bytes32 blobId,        // 0G Storage root hash
  string modelName,      // Source AI model
  string description,    // Human-readable label
  bool isPublic,         // Listed on marketplace?
  uint256 sizeBytes      // Blob size
) returns (uint256 tokenId)

// Grant another wallet access to your private context
function grantAccess(uint256 tokenId, address grantee)

// Revoke previously granted access
function revokeAccess(uint256 tokenId, address grantee)

// Check if an address has access
function hasAccess(uint256 tokenId, address user) view returns (bool)

// Log an access event (DA audit trail)
function logAccess(uint256 tokenId)

// Read all token IDs owned by an address
function tokensOf(address owner) view returns (uint256[])

// Read full context metadata for a token
function contextData(uint256 tokenId) view returns (
  bytes32 blobId, string modelName, string description,
  uint256 createdAt, bool isPublic, uint256 sizeBytes
)
```

### Events
```solidity
event ContextMinted(uint256 indexed tokenId, bytes32 indexed blobId, address indexed owner, string modelName)
event AccessGranted(uint256 indexed tokenId, address indexed grantee)
event ContextAccessed(uint256 indexed tokenId, address indexed accessor, uint256 timestamp)
```

---

## Encryption & Access Control

### How Encryption Works (Current Implementation)
```
key  = random 32-byte hex string (stored server-side per context)
encrypted = content XOR key (repeating key)
stored_on_0G = base64(encrypted)
```
On load: `decrypted = base64_decode(stored) XOR key`

### Production Design (Sealed Inference Path)
In the full design, decryption never leaves the TEE:
1. Owner stores context → 0G Compute (TEE) encrypts with an enclave-internal key.
2. Enclave publishes a commitment on 0G Chain.
3. When a grantee loads → `hasAccess(tokenId, caller)` is checked on-chain.
4. Only if true does the TEE decrypt and return plaintext — the raw key is never exposed.
5. Every load triggers `logAccess(tokenId)` → permanently logged on 0G DA.

### Sharing Access
- **Public contexts**: Just share the blob ID. Anyone can load without any on-chain permission.
- **Private contexts**: Owner calls `grantAccess(tokenId, granteeAddress)` on-chain. Grantee's address is now authorized. In the TEE path the enclave re-encrypts the key for the grantee's public key.

---

## About the AI Models

0GMind does **not** run Claude, GPT-4, or any proprietary model. It stores *text the user already owns*.

The "Source Model" label (e.g. "Claude Sonnet 4.5") is metadata — it records where the memory *came from*, not what runs it.

For inference (summaries + chat), we use:
- **0G Compute** → open models served on the 0G decentralized GPU network (GLM-4 by default).
- The endpoint is OpenAI-compatible: `baseURL = https://api.0g.ai/v1`.
- **No Anthropic/OpenAI API key required.** Models run on 0G infrastructure.

For loading into a proprietary model: the user copies the loaded context blob into their own Claude/GPT subscription. We are the memory layer; they bring the model.

---

## Project Structure

```
zerocup/
├── 0gmind/                          # Next.js 15 frontend
│   ├── app/
│   │   ├── page.tsx                 # Home hero + sections
│   │   ├── store/page.tsx           # Store context page
│   │   ├── load/page.tsx            # Load + chat page
│   │   ├── dashboard/page.tsx       # My NFTs + public contexts
│   │   └── marketplace/page.tsx     # Browse public contexts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Navbar.tsx           # Sub-page navigation
│   │   │   ├── MemoryCore.tsx       # Three.js 3D hero animation
│   │   │   └── icons.tsx            # All custom hand-built SVG icons
│   │   └── chain/
│   │       ├── config.ts            # 0G network config + contract ABI
│   │       └── useContextRegistry.ts # ethers.js hook (mint, grant, load NFTs)
│   ├── contracts/
│   │   └── ContextRegistry.sol      # ERC-721 — deploy this to 0G Galileo
│   ├── .env.local                   # Frontend env vars
│   └── .env.example                 # Template
│
└── 0gmind-backend/                  # Express.js backend
    ├── src/
    │   ├── index.ts                 # Server entry point (port 3001)
    │   ├── routes/context.ts        # All API routes
    │   ├── services/
    │   │   ├── storageService.ts    # 0G Storage upload/download + encrypt/decrypt
    │   │   └── computeService.ts    # 0G Compute summarize + chat
    │   └── types/index.ts           # TypeScript interfaces
    ├── .env                         # Backend env vars
    └── .env.example                 # Template
```

---

## Environment Variables

### Frontend (`0gmind/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ZERO_G_RPC=https://evmrpc-testnet.0g.ai
NEXT_PUBLIC_CHAIN_ID=16602
NEXT_PUBLIC_CONTEXT_REGISTRY_ADDRESS=0x958a498B4f1Bd1F197BC177F8398e656efD44422
NEXT_PUBLIC_EXPLORER_URL=https://chainscan-galileo.0g.ai
```

### Backend (`0gmind-backend/.env`)
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
ZERO_G_RPC=https://evmrpc-testnet.0g.ai
ZERO_G_STORAGE_INDEXER=https://indexer-storage-testnet-standard.0g.ai
FLOW_CONTRACT=0x22E03a6A89B50F1c82ec5e74F8eCa321a105296
CONTEXT_REGISTRY_ADDRESS=0x958a498B4f1Bd1F197BC177F8398e656efD44422
BACKEND_PRIVATE_KEY=          # Wallet private key (for submitting to Flow contract)
ZERO_G_COMPUTE_BASE_URL=https://api.0g.ai/v1
ZERO_G_COMPUTE_API_KEY=       # 0G Compute API key
ZERO_G_COMPUTE_MODEL=glm-4
```

---

## Running Locally

### 1. Get testnet tokens
Faucet: https://faucet.0g.ai (need OG tokens for gas on 0G Galileo)

### 2. Backend
```bash
cd 0gmind-backend
cp .env.example .env
# fill BACKEND_PRIVATE_KEY and ZERO_G_COMPUTE_API_KEY
npm install
npm run dev
# → http://localhost:3001
```

### 3. Frontend
```bash
cd 0gmind
cp .env.example .env.local
npm install
npm run dev
# → http://localhost:3000
```

### 4. Contract (already deployed)
The contract is already live at `0x958a498B4f1Bd1F197BC177F8398e656efD44422` on 0G Galileo.
To redeploy:
1. Open `contracts/ContextRegistry.sol` in [Remix](https://remix.ethereum.org)
2. Compiler: Solidity 0.8.20, EVM: Paris
3. Deploy to 0G Galileo — Chain ID `16602`, RPC `https://evmrpc-testnet.0g.ai`
4. Update `NEXT_PUBLIC_CONTEXT_REGISTRY_ADDRESS` and `CONTEXT_REGISTRY_ADDRESS`

---

## 0G Network Reference

| Property | Value |
|---|---|
| Network | 0G Galileo Testnet |
| Chain ID | 16602 |
| RPC | https://evmrpc-testnet.0g.ai |
| Explorer | https://chainscan-galileo.0g.ai |
| Faucet | https://faucet.0g.ai |
| Storage Indexer | https://indexer-storage-testnet-standard.0g.ai |
| Flow Contract | 0x22E03a6A89B50F1c82ec5e74F8eCa321a105296 |
| Compute API | https://api.0g.ai/v1 |

---

## Why 0G — Not Just Any Chain

| Requirement | Why 0G Wins |
|---|---|
| Store large AI contexts (MBs of text) on-chain | 2 GB/s decentralized storage. No other chain can do this at cost. |
| Process context privately | Sealed Inference TEE. No other EVM chain has this. |
| Sub-second ownership transfer | 0G Chain finality. Ethereum would take 12 seconds per block. |
| Tamper-proof access audit trail | 0G DA at 50,000× Ethereum DA speed. |

**0G is not a bolt-on.** Remove any single layer and the product breaks:
- No Storage → can't store contexts.
- No Compute → no privacy, no AI summaries.
- No Chain → no ownership, no access control.
- No DA → no audit trail, no enterprise trust.

---

## Repositories

| Repo | URL |
|---|---|
| Frontend | https://github.com/potatodevx/0gmind |
| Backend | https://github.com/potatodevx/0gmind_backend |

---

Built with care for **Zero Cup 2026** · 0G Galileo Testnet · Portable AI memory.
