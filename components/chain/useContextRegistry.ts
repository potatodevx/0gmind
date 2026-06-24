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
    grantAccess,
    revokeAccess,
    logAccess,
    getTotalSupply,
    checkConnection,
    contractAddress: CONTEXT_REGISTRY_ADDRESS,
    explorerUrl: ZERO_G_CHAIN.blockExplorers.default.url,
  };
}
