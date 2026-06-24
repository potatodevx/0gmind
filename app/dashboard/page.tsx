'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useContextRegistry } from '@/components/chain/useContextRegistry';
import type { OnChainContext } from '@/components/chain/useContextRegistry';

const EXPLORER = process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://chainscan-galileo.0g.ai';
const CONTRACT = process.env.NEXT_PUBLIC_CONTEXT_REGISTRY_ADDRESS || '';

export default function DashboardPage() {
  const { account, connecting, connectWallet, getMyContexts, grantAccess, getTotalSupply, checkConnection, contractAddress } = useContextRegistry();

  const [onChainContexts, setOnChainContexts] = useState<OnChainContext[]>([]);
  const [apiContexts, setApiContexts] = useState<{ contextId: string; model: string; description: string; summary: string; size: number; timestamp: number; accessCount: number }[]>([]);
  const [totalSupply, setTotalSupply] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');
  const [grantInput, setGrantInput] = useState<{ tokenId: number; addr: string } | null>(null);
  const [txPending, setTxPending] = useState('');

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const loadData = useCallback(async (addr: string) => {
    setLoading(true);
    const [chain, api, supply] = await Promise.allSettled([
      getMyContexts(addr),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/context/list`).then(r => r.json()),
      getTotalSupply(),
    ]);

    if (chain.status === 'fulfilled') setOnChainContexts(chain.value);
    if (api.status === 'fulfilled') setApiContexts(api.value.contexts || []);
    if (supply.status === 'fulfilled') setTotalSupply(supply.value);
    setLoading(false);
  }, [getMyContexts, getTotalSupply]);

  useEffect(() => {
    checkConnection().then((addr) => { if (addr) loadData(addr); });
    getTotalSupply().then(setTotalSupply);
    // load API contexts regardless of wallet
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/context/list`)
      .then(r => r.json()).then(d => setApiContexts(d.contexts || [])).catch(() => {});
  }, [checkConnection, loadData, getTotalSupply]);

  const handleConnect = async () => {
    const addr = await connectWallet();
    if (addr) loadData(addr);
  };

  const isValidAddress = (addr: string) => /^0x[0-9a-fA-F]{40}$/.test(addr);

  const handleGrant = async (tokenId: number, addr: string) => {
    if (!addr || !isValidAddress(addr)) return;
    setTxPending(`grant-${tokenId}`);
    try {
      await grantAccess(tokenId, addr);
      setGrantInput(null);
    } catch (e) { console.error(e); }
    setTxPending('');
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const formatSize = (bytes: number) => bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;

  return (
    <div style={{ background: '#050a14', minHeight: '100vh', paddingTop: '80px' }}>
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-black text-4xl mb-1" style={{ color: 'white' }}>
              <span className="gradient-text">Dashboard</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
              Contract:{' '}
              <a href={`${EXPLORER}/address/${contractAddress}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs" style={{ color: '#00d4ff' }}>
                {contractAddress.slice(0, 10)}...{contractAddress.slice(-6)} ↗
              </a>
            </p>
          </div>
          <Link href="/store">
            <button className="btn-primary">+ Store New</button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total On-Chain', value: totalSupply, color: '#00d4ff' },
            { label: 'My NFTs', value: onChainContexts.length, color: '#8b5cf6' },
            { label: 'Public Contexts', value: apiContexts.length, color: '#10b981' },
            { label: 'Network', value: 'Galileo', color: '#f59e0b', isText: true },
          ].map((s, i) => (
            <div key={i} className="card-glow rounded-xl p-5 text-center" style={{ background: '#0d1526' }}>
              <div className="font-black text-2xl mb-1" style={{ color: s.color }}>
                {s.isText ? s.value : s.value}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Wallet section */}
        {!account ? (
          <div className="rounded-2xl p-6 mb-8 text-center" style={{ background: '#0d1526', border: '1px solid rgba(245,158,11,0.3)' }}>
            <div className="text-3xl mb-3">🔗</div>
            <div className="font-bold text-lg mb-2" style={{ color: '#f59e0b' }}>Connect to see your on-chain NFTs</div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Connect MetaMask to view contexts you own on 0G Chain
            </p>
            <button onClick={handleConnect} disabled={connecting} className="btn-primary">
              {connecting ? 'Connecting...' : 'Connect MetaMask'}
            </button>
          </div>
        ) : (
          <div className="rounded-xl p-4 mb-6 flex items-center gap-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
            <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>Wallet Connected</span>
            <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {account.slice(0, 8)}...{account.slice(-6)}
            </span>
            <button onClick={() => loadData(account)} style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#00d4ff' }}>
              ↺ Refresh
            </button>
          </div>
        )}

        {/* On-chain NFTs */}
        {account && (
          <section className="mb-10">
            <h2 className="font-bold text-lg mb-4" style={{ color: 'white' }}>
              ⛓️ Your On-Chain Context NFTs
              <span className="ml-2 text-sm font-normal" style={{ color: 'rgba(255,255,255,0.35)' }}>(0G Chain)</span>
            </h2>

            {loading ? (
              <div className="text-center py-10" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <div className="spinner inline-block w-6 h-6 border-2 rounded-full mb-2" style={{ borderColor: 'rgba(0,212,255,0.2)', borderTopColor: '#00d4ff' }} />
                <div className="text-sm">Loading from 0G Chain...</div>
              </div>
            ) : onChainContexts.length === 0 ? (
              <div className="rounded-xl p-6 text-center" style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>No NFTs found for this wallet. Store a context to mint one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {onChainContexts.map((ctx) => (
                  <div key={ctx.tokenId} className="card-glow rounded-2xl p-5" style={{ background: '#0d1526' }}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(139,92,246,0.2)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.3)' }}>
                            NFT #{ctx.tokenId}
                          </span>
                          <span className="font-semibold" style={{ color: 'white' }}>
                            {ctx.description || 'Untitled Context'}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded" style={{ background: ctx.isPublic ? 'rgba(16,185,129,0.15)' : 'rgba(139,92,246,0.15)', color: ctx.isPublic ? '#10b981' : '#8b5cf6', border: `1px solid ${ctx.isPublic ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.3)'}` }}>
                            {ctx.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                          {ctx.modelName} · {formatSize(ctx.sizeBytes)} · {timeAgo(ctx.createdAt)}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link href={`/load?id=${ctx.blobId}`}>
                          <button className="btn-secondary text-xs px-3 py-2">Load →</button>
                        </Link>
                        <a href={`${EXPLORER}/token/${CONTRACT}?a=${account}`} target="_blank" rel="noopener noreferrer">
                          <button className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }}>
                            Explorer ↗
                          </button>
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="blob-id text-xs px-2 py-1 truncate max-w-xs">
                        {ctx.blobId.slice(0, 26)}...
                      </div>
                      <button onClick={() => copy(ctx.blobId, ctx.blobId)} style={{ fontSize: '0.75rem', color: copied === ctx.blobId ? '#10b981' : 'rgba(255,255,255,0.35)' }}>
                        {copied === ctx.blobId ? '✓ Copied' : 'Copy Blob ID'}
                      </button>

                      {/* Grant access */}
                      {grantInput?.tokenId === ctx.tokenId ? (
                        <div className="flex gap-2 ml-auto">
                          <input
                            type="text"
                            value={grantInput.addr}
                            onChange={(e) => setGrantInput({ tokenId: ctx.tokenId, addr: e.target.value })}
                            placeholder="0x... address"
                            className="rounded-lg px-3 py-1 text-xs font-mono focus:outline-none"
                            style={{ background: '#0a0f1e', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', width: '200px' }}
                          />
                          <button onClick={() => handleGrant(ctx.tokenId, grantInput.addr)} disabled={!!txPending} className="text-xs px-3 py-1 rounded-lg" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                            {txPending === `grant-${ctx.tokenId}` ? '...' : 'Grant'}
                          </button>
                          <button onClick={() => setGrantInput(null)} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setGrantInput({ tokenId: ctx.tokenId, addr: '' })} style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                          + Grant Access
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* API/public contexts */}
        <section>
          <h2 className="font-bold text-lg mb-4" style={{ color: 'white' }}>
            🗄️ Public Contexts
            <span className="ml-2 text-sm font-normal" style={{ color: 'rgba(255,255,255,0.35)' }}>(0G Storage)</span>
          </h2>
          {apiContexts.length === 0 ? (
            <div className="rounded-xl p-6 text-center" style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>No public contexts yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiContexts.map((ctx) => (
                <div key={ctx.contextId} className="card-glow rounded-2xl p-4" style={{ background: '#0d1526' }}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold mb-0.5 truncate" style={{ color: 'white' }}>{ctx.description || 'Untitled'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                        {ctx.model} · {formatSize(ctx.size)} · {ctx.accessCount} loads · {timeAgo(ctx.timestamp)}
                      </div>
                    </div>
                    <Link href={`/load?id=${ctx.contextId}`} className="flex-shrink-0">
                      <button className="btn-secondary text-xs px-4 py-2">Load →</button>
                    </Link>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="blob-id text-xs px-2 py-1 truncate max-w-xs">{ctx.contextId.slice(0, 30)}...</div>
                    <button onClick={() => copy(ctx.contextId, ctx.contextId)} style={{ fontSize: '0.75rem', color: copied === ctx.contextId ? '#10b981' : 'rgba(255,255,255,0.35)' }}>
                      {copied === ctx.contextId ? '✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

