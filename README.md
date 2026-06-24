# 0GMind — Portable AI Memory on 0G

> **One Blob ID. Any Agent. Forever.**

0GMind is a protocol that gives every AI agent a portable, encrypted, on-chain memory. Pass a single blob ID between any models, companies, or agents — and they instantly inherit the full context.

Built for [Zero Cup 2026](https://0g.ai/arena/zero-cup) · 0G Galileo Testnet

---

## The Pain Points We're Solving

### 1. AI Agents Have Amnesia By Design
Every AI session starts from zero. Switch from Claude to GPT-4, deploy a new agent version, or move between companies — and all accumulated knowledge is wiped. There is no standard way to carry memory across boundaries.

### 2. Context Is Trapped in Silos
Company A's AI knows a customer deeply after months of interaction. That knowledge lives inside a closed API. The moment work moves to Company B — or even a different model at the same company — it's gone. There is no interoperable format for AI memory.

### 3. No Ownership Over Your AI Memory
Every conversation you've had with an AI model belongs to the platform, not you. You can't transfer it, monetize it, license it, or even export it in a usable way. There is no on-chain proof that you created or own a piece of context.

### 4. No Privacy Guarantee for Sensitive Contexts
Enterprise conversations — legal discussions, medical consultations, product strategy — need strong privacy guarantees. Storing this in a centralized server means trusting operators not to read your data. That's not good enough.

### 5. No Audit Trail for AI Access
When a shared context is loaded by an agent, there's no record of who accessed it, when, or how many times. For regulated industries, that's a non-starter.

---

## How 0GMind Solves This

### Portable Memory — One Blob ID
Store any AI conversation, system prompt, or agent memory as a single encrypted blob on 0G Storage. You get back a **blob ID** — a short hash that encodes your entire context. Hand that ID to any agent, any model, any company. They load it and instantly have the full picture.

### True Ownership on 0G Chain
Every stored context is minted as an **ERC-721 NFT** on 0G Chain. You hold the token — you own the memory. Transfer it to a colleague. License it to another company. Revoke access anytime. Ownership is on-chain, not locked inside a platform.

### Selective Access Without Giving Up Ownership
Private contexts are encrypted. Only the owner's wallet can load them by default. But you can call `grantAccess(tokenId, address)` on-chain to authorize specific wallets — without handing over the raw data or losing ownership. Revoke with one transaction.

### Privacy via Sealed Inference
When private contexts are processed, inference runs inside a **Trusted Execution Environment (TEE)** on 0G Compute. Not even the node operator can read the plaintext data. This is a cryptographic privacy guarantee, not a policy promise.

### Permanent Audit Trail on 0G DA
Every time a context is loaded, the access is logged on **0G DA** — permanently and tamper-proof. Who accessed it, when, how many times. Full compliance trail baked into the protocol.

### Model-Agnostic by Design
0GMind stores *text the user already owns* — not model weights, not proprietary APIs. The stored memory works with any model. Store a conversation from Claude, load it into Llama, continue it in GPT-4. The memory outlives the model.

---

## How We Empower the Full 0G Stack

0GMind is one of the few applications that genuinely requires all four 0G layers. Remove any one of them and the product fundamentally breaks.

### 0G Storage — The Memory Layer
Every context blob lives here. 0G Storage's **2 GB/s throughput** makes it the only decentralized storage fast enough for real-time AI context delivery. A 50,000-token conversation loads in milliseconds, not minutes. No other decentralized storage system can match this for production AI workloads.

**What we use it for:** Storing every encrypted context blob, referenced by its root hash (blob ID).

### 0G Compute (Sealed Inference) — The Privacy Layer
0G Compute runs AI models inside a TEE with a verifiable attestation. This is the only platform where you can run inference with a cryptographic guarantee that nobody — including the infrastructure provider — can read the input data.

**What we use it for:** (1) Generating AI summaries of stored contexts at upload time. (2) Answering queries by injecting the loaded context as a system prompt — all inside the enclave.

### 0G Chain — The Ownership Layer
Sub-second finality means ownership transfers are instant, not pending for 12 seconds per Ethereum block. The `ContextRegistry` ERC-721 contract records every blob ID as a token, with on-chain access control (`grantAccess`, `revokeAccess`, `hasAccess`) and metadata.

**What we use it for:** Proving who owns which context, enforcing access permissions, and emitting on-chain events for every transfer and grant.

### 0G DA — The Accountability Layer
0G DA is 50,000× faster than Ethereum DA, making it viable for high-frequency event logging. Every `logAccess` call is posted as a DA blob — a permanent, uncensorable record.

**What we use it for:** Immutable access audit trail. Every load of a context by any agent is logged forever.

---

## Usage

### Store a Context
1. Go to `/store`
2. Connect MetaMask (0G Galileo Testnet, Chain ID 16602)
3. Paste any AI conversation, system prompt, or agent memory
4. Choose source model and description
5. Toggle **Public** (visible in marketplace) or **Private** (encrypted, TEE-gated)
6. Click **Store on 0G + Mint NFT**
   - Your context is uploaded to 0G Storage
   - An NFT is minted on 0G Chain — you own this memory
   - You receive a **blob ID** to share

### Load a Context
1. Go to `/load`
2. Paste the blob ID
3. Click **Load** — the context is fetched and decrypted from 0G Storage
4. Use the **Chat** box to ask questions — 0G Compute answers using the loaded memory as context

### Grant Access to Someone
1. Go to `/dashboard`
2. Find the NFT for the context you want to share
3. Click **Grant Access** → enter their wallet address
4. One on-chain transaction — they can now load your private context

### Browse the Marketplace
1. Go to `/marketplace`
2. Browse public contexts stored by anyone on the network
3. Filter by source model or search by description
4. Click **Load Context →** to load any public context directly

---

## Running Locally

### Prerequisites
- Node.js 18+
- MetaMask with OG tokens — get them at [faucet.0g.ai](https://faucet.0g.ai)

### Backend
```bash
cd 0gmind-backend
cp .env.example .env
# Fill in BACKEND_PRIVATE_KEY and ZERO_G_COMPUTE_API_KEY
npm install
npm run dev
# Runs on http://localhost:3001
```

### Frontend
```bash
cd 0gmind
cp .env.example .env.local
npm install
npm run dev
# Runs on http://localhost:3000
```

### Contract (already deployed)
Live at `0x958a498B4f1Bd1F197BC177F8398e656efD44422` on 0G Galileo.
To redeploy: open `contracts/ContextRegistry.sol` in [Remix](https://remix.ethereum.org), deploy to Chain ID `16602` (RPC: `https://evmrpc-testnet.0g.ai`), then update `NEXT_PUBLIC_CONTEXT_REGISTRY_ADDRESS`.

---

## 0G Network

| Property | Value |
|---|---|
| Network | 0G Galileo Testnet |
| Chain ID | 16602 |
| RPC | https://evmrpc-testnet.0g.ai |
| Explorer | https://chainscan-galileo.0g.ai |
| Faucet | https://faucet.0g.ai |

---

## Repositories

| | URL |
|---|---|
| Frontend | https://github.com/potatodevx/0gmind |
| Backend | https://github.com/potatodevx/0gmind_backend |

---

Built for **Zero Cup 2026** · 0G Galileo Testnet
