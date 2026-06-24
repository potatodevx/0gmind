'use client';

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTEXT_REGISTRY_ADDRESS, CONTEXT_REGISTRY_ABI, ZERO_G_CHAIN } from './config';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

export interface OnChainContext {
  tokenId: number;
  blobId: string;
  modelName: string;
  description: string;
  createdAt: number;
  isPublic: boolean;
  sizeBytes: number;
  owner: string;
}

export interface AccessLogEntry {
  type: 'Minted' | 'Granted' | 'Accessed';
  tokenId: number;
  actor: string;        // owner / grantee / accessor address
  txHash: string;
  blockNumber: number;
}

export function useContextRegistry() {
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  // Connect MetaMask and switch to 0G Galileo
  const connectWallet = useCallback(async (): Promise<string | null> => {
    if (!window.ethereum) {
      setError('MetaMask not found. Please install MetaMask.');
      return null;
    }
    setConnecting(true);
    setError('');
    try {
      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      const addr = accounts[0];

      // Switch to 0G Galileo
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${ZERO_G_CHAIN.id.toString(16)}` }],
        });
      } catch (switchErr: unknown) {
        // Chain not added yet — add it
        if ((switchErr as { code?: number }).code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${ZERO_G_CHAIN.id.toString(16)}`,
              chainName: ZERO_G_CHAIN.name,
              nativeCurrency: ZERO_G_CHAIN.nativeCurrency,
              rpcUrls: [ZERO_G_CHAIN.rpcUrls.default.http[0]],
              blockExplorerUrls: [ZERO_G_CHAIN.blockExplorers.default.url],
            }],
          });
        }
      }

      setAccount(addr);
      return addr;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      return null;
    } finally {
      setConnecting(false);
    }
  }, []);

  const getProvider = () => {
    if (!window.ethereum) throw new Error('MetaMask not found');
    return new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
  };

  // Mint a context NFT on 0G Chain
  const mintContext = useCallback(async (
    contextId: string,  // 0G Storage root hash
    modelName: string,
    description: string,
    isPublic: boolean,
    sizeBytes: number
  ): Promise<{ tokenId: number; txHash: string }> => {
    const provider = getProvider();
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      CONTEXT_REGISTRY_ADDRESS,
      CONTEXT_REGISTRY_ABI,
      signer
    );

    // Convert contextId (hex string) to bytes32
    let blobId: string;
    if (contextId.startsWith('0x') && contextId.length === 66) {
      blobId = contextId;
    } else {
      // Hash it to get a bytes32
      blobId = ethers.keccak256(ethers.toUtf8Bytes(contextId));
    }

    const tx = await contract.mintContext(
      blobId,
      modelName,
      description,
      isPublic,
      BigInt(sizeBytes)
    );

    const receipt = await tx.wait();

    // Parse ContextMinted event to get tokenId
    let tokenId = 0;
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed?.name === 'ContextMinted') {
          tokenId = Number(parsed.args.tokenId);
          break;
        }
      } catch {
        // skip unparseable logs
      }
    }

    return { tokenId, txHash: receipt.hash };
  }, []);

  // Get all contexts owned by an address
  const getMyContexts = useCallback(async (owner: string): Promise<OnChainContext[]> => {
    const provider = getProvider();
    const contract = new ethers.Contract(
      CONTEXT_REGISTRY_ADDRESS,
      CONTEXT_REGISTRY_ABI,
      provider
    );

    const tokenIds: bigint[] = await contract.tokensOf(owner);
    const contexts: OnChainContext[] = [];

    for (const tokenId of tokenIds) {
      try {
        const data = await contract.contextData(tokenId);
        const ownerAddr: string = await contract.ownerOf(tokenId);
        contexts.push({
          tokenId: Number(tokenId),
          blobId: data.blobId,
          modelName: data.modelName,
          description: data.description,
          createdAt: Number(data.createdAt) * 1000,
          isPublic: data.isPublic,
          sizeBytes: Number(data.sizeBytes),
          owner: ownerAddr,
        });
      } catch {
        // skip invalid tokens
      }
    }
    return contexts.sort((a, b) => b.createdAt - a.createdAt);
  }, []);

  // Read ALL public contexts directly from chain (persistent — survives backend restarts)
  const getAllPublicContexts = useCallback(async (): Promise<OnChainContext[]> => {
    try {
      const provider = new ethers.JsonRpcProvider(ZERO_G_CHAIN.rpcUrls.default.http[0]);
      const contract = new ethers.Contract(CONTEXT_REGISTRY_ADDRESS, CONTEXT_REGISTRY_ABI, provider);
      const total = Number(await contract.totalSupply());
      const out: OnChainContext[] = [];
      for (let i = 1; i <= total; i++) {
        try {
          const d = await contract.contextData(i);
          if (!d.isPublic) continue;
          const owner: string = await contract.ownerOf(i);
          out.push({
            tokenId: i,
            blobId: d.blobId,
            modelName: d.modelName,
            description: d.description,
            createdAt: Number(d.createdAt) * 1000,
            isPublic: d.isPublic,
            sizeBytes: Number(d.sizeBytes),
            owner,
          });
        } catch {
          // skip invalid token
        }
      }
      return out.sort((a, b) => b.createdAt - a.createdAt);
    } catch {
      return [];
    }
  }, []);

  // Grant access to an address
  const grantAccess = useCallback(async (tokenId: number, grantee: string): Promise<string> => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTEXT_REGISTRY_ADDRESS, CONTEXT_REGISTRY_ABI, signer);
    const tx = await contract.grantAccess(BigInt(tokenId), grantee);
    const receipt = await tx.wait();
    return receipt.hash;
  }, []);

  // Revoke access
  const revokeAccess = useCallback(async (tokenId: number, revokee: string): Promise<string> => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTEXT_REGISTRY_ADDRESS, CONTEXT_REGISTRY_ABI, signer);
    const tx = await contract.revokeAccess(BigInt(tokenId), revokee);
    const receipt = await tx.wait();
    return receipt.hash;
  }, []);

  // Log an access event on-chain
  const logAccess = useCallback(async (tokenId: number): Promise<string> => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTEXT_REGISTRY_ADDRESS, CONTEXT_REGISTRY_ABI, signer);
    const tx = await contract.logAccess(BigInt(tokenId));
    const receipt = await tx.wait();
    return receipt.hash;
  }, []);

  // Convert a blob ID (root hash or arbitrary string) to its on-chain bytes32 form
  const toBlobBytes32 = (blobId: string): string =>
    blobId.startsWith('0x') && blobId.length === 66
      ? blobId
      : ethers.keccak256(ethers.toUtf8Bytes(blobId));

  // Best-effort: log an access event on-chain for a given blob ID.
  // Returns the tx hash, or null if the blob isn't minted / no wallet.
  const logAccessByBlob = useCallback(async (blobId: string): Promise<string | null> => {
    if (!window.ethereum) return null;
    try {
      const provider = getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTEXT_REGISTRY_ADDRESS, CONTEXT_REGISTRY_ABI, signer);
      const tokenId = await contract.blobToToken(toBlobBytes32(blobId));
      if (Number(tokenId) === 0) return null; // not minted on-chain
      const tx = await contract.logAccess(tokenId);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch {
      return null;
    }
  }, []);

  // Read the on-chain audit trail: mints, grants and accesses (0G DA layer).
  const getAccessLog = useCallback(async (): Promise<AccessLogEntry[]> => {
    try {
      const provider = new ethers.JsonRpcProvider(ZERO_G_CHAIN.rpcUrls.default.http[0]);
      const contract = new ethers.Contract(CONTEXT_REGISTRY_ADDRESS, CONTEXT_REGISTRY_ABI, provider);
      const latest = await provider.getBlockNumber();

      // Query a filter, shrinking the block range if the RPC rejects it
      const queryRange = async (filter: ethers.DeferredTopicFilter) => {
        let span = 90000;
        for (let attempt = 0; attempt < 5; attempt++) {
          try {
            const from = Math.max(0, latest - span);
            return await contract.queryFilter(filter, from, latest);
          } catch {
            span = Math.floor(span / 3);
          }
        }
        return [];
      };

      const [minted, granted, accessed] = await Promise.all([
        queryRange(contract.filters.ContextMinted()),
        queryRange(contract.filters.AccessGranted()),
        queryRange(contract.filters.ContextAccessed()),
      ]);

      const entries: AccessLogEntry[] = [];
      for (const e of minted) {
        const ev = e as ethers.EventLog;
        entries.push({ type: 'Minted', tokenId: Number(ev.args.tokenId), actor: ev.args.owner, txHash: ev.transactionHash, blockNumber: ev.blockNumber });
      }
      for (const e of granted) {
        const ev = e as ethers.EventLog;
        entries.push({ type: 'Granted', tokenId: Number(ev.args.tokenId), actor: ev.args.grantee, txHash: ev.transactionHash, blockNumber: ev.blockNumber });
      }
      for (const e of accessed) {
        const ev = e as ethers.EventLog;
        entries.push({ type: 'Accessed', tokenId: Number(ev.args.tokenId), actor: ev.args.accessor, txHash: ev.transactionHash, blockNumber: ev.blockNumber });
      }

      return entries.sort((a, b) => b.blockNumber - a.blockNumber).slice(0, 30);
    } catch {
      return [];
    }
  }, []);

  // Read total supply
  const getTotalSupply = useCallback(async (): Promise<number> => {
    try {
      const provider = new ethers.JsonRpcProvider(ZERO_G_CHAIN.rpcUrls.default.http[0]);
      const contract = new ethers.Contract(CONTEXT_REGISTRY_ADDRESS, CONTEXT_REGISTRY_ABI, provider);
      const total = await contract.totalSupply();
      return Number(total);
    } catch {
      return 0;
    }
  }, []);

  // Check if MetaMask is connected
  const checkConnection = useCallback(async (): Promise<string | null> => {
    if (!window.ethereum) return null;
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        return accounts[0];
      }
    } catch {
      // not connected
    }
    return null;
  }, []);

  return {
    account,
    connecting,
    error,
    connectWallet,
    mintContext,
    getMyContexts,
    getAllPublicContexts,
    grantAccess,
    revokeAccess,
    logAccess,
    logAccessByBlob,
    getAccessLog,
    getTotalSupply,
    checkConnection,
    contractAddress: CONTEXT_REGISTRY_ADDRESS,
    explorerUrl: ZERO_G_CHAIN.blockExplorers.default.url,
  };
}
