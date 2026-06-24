'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useContextRegistry } from '@/components/chain/useContextRegistry';

const MODELS = ['Claude Sonnet 4.5', 'GPT-4o', 'Gemini 1.5 Pro', 'GLM-5', 'Llama 3.1', 'Mistral Large', 'Custom'];
const EXPLORER = process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://chainscan-galileo.0g.ai';

type Step = 'idle' | 'storing' | 'minting' | 'done';

export default function StorePage() {
  const { account, connecting, connectWallet, mintContext, checkConnection, contractAddress } = useContextRegistry();

  const [content, setContent] = useState('');
  const [model, setModel] = useState('Claude Sonnet 4.5');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [step, setStep] = useState<Step>('idle');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const [result, setResult] = useState<{
    contextId: string;
    txHash: string;
    mintTxHash: string;
    tokenId: number;
    size: number;
    summary: string;
    encrypted: boolean;
    tokenCount: number;
  } | null>(null);

  useEffect(() => { checkConnection(); }, [checkConnection]);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleStore = async () => {
    if (!content.trim()) { setError('Please paste your agent context.'); return; }
    if (!account) { setError('Connect your wallet first to mint ownership on 0G Chain.'); return; }

    setError('');
    setResult(null);

    // ── Step 1: Store on 0G Storage ─────────────────────────────────────────
    setStep('storing');
    let storeData: {
      contextId: string; txHash: string; metadata: {
        size: number; summary: string; encrypted: boolean; tokenCount: number;
      };
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/context/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, modelName: model, description, isPublic }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Storage failed');
      storeData = data;
    } catch (err: unknown) {
      setStep('idle');
      setError(err instanceof Error ? err.message : 'Failed to store on 0G Storage');
      return;
    }

    // ── Step 2: Mint NFT on 0G Chain ─────────────────────────────────────────
    setStep('minting');
    let tokenId = 0;
    let mintTxHash = '';

    try {
      const mint = await mintContext(
        storeData.contextId,
        model,
        description || 'AI Context',
        isPublic,
        storeData.metadata.size
      );
      tokenId = mint.tokenId;
      mintTxHash = mint.txHash;
    } catch (err: unknown) {
      // Minting failed — still show storage result, just without NFT
      console.error('Mint failed:', err);
      mintTxHash = '';
      tokenId = 0;
    }

    setStep('done');
    setResult({
      contextId: storeData.contextId,
      txHash: storeData.txHash,
      mintTxHash,
      tokenId,
      size: storeData.metadata.size,
      summary: storeData.metadata.summary,
      encrypted: storeData.metadata.encrypted,
      tokenCount: storeData.metadata.tokenCount,
    });
  };

  const stepLabels: Record<Step, string> = {
    idle: '',
    storing: 'Storing on 0G Storage...',
    minting: 'Minting ownership NFT on 0G Chain...',
    done: '',
  };

  return (
    <div style={{ background: '#050a14', minHeight: '100vh', paddingTop: '80px' }}>
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-sm mb-4 inline-flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.4)' }}>← Back</Link>
          <h1 className="font-black text-4xl mb-2" style={{ color: 'white' }}>
            Store <span className="gradient-text">Context</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>
            Paste your AI conversation. It gets stored on 0G Storage and minted as an NFT on 0G Chain.
          </p>
        </div>

        {/* Wallet Connect Banner */}
        {!account ? (
          <div className="rounded-2xl p-5 mb-6 flex items-center justify-between" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <div>
              <div className="font-semibold mb-0.5" style={{ color: '#f59e0b' }}>Connect MetaMask to mint on-chain</div>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)' }}>
                Required for 0G Chain NFT ownership. Storage works without it.
              </p>
            </div>
            <button
              onClick={connectWallet}
              disabled={connecting}
              className="btn-primary px-5 py-2.5 text-sm flex-shrink-0"
              style={{ opacity: connecting ? 0.7 : 1 }}
            >
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        ) : (
          <div className="rounded-xl p-4 mb-6 flex items-center gap-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
            <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>Connected</span>
            <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>
              0G Galileo Testnet
            </span>
          </div>
        )}

        {/* Form */}
        {step !== 'done' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Agent Context / Conversation *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your AI conversation, system prompt, agent memory, task history..."
                rows={12}
                disabled={step !== 'idle'}
                className="w-full rounded-xl p-4 text-sm font-mono resize-none focus:outline-none"
                style={{
                  background: '#0d1526',
                  border: '1px solid rgba(0,212,255,0.2)',
                  color: 'rgba(255,255,255,0.85)',
                  lineHeight: 1.6,
                  opacity: step !== 'idle' ? 0.5 : 1,
                }}
              />
              <div className="flex justify-between mt-1">
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                  {content.length.toLocaleString()} chars · ~{Math.ceil(content.length / 4).toLocaleString()} tokens
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>AI Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={step !== 'idle'}
                  className="w-full rounded-xl p-3 text-sm focus:outline-none"
                  style={{ background: '#0d1526', border: '1px solid rgba(0,212,255,0.2)', color: 'rgba(255,255,255,0.85)' }}
                >
                  {MODELS.map((m) => <option key={m} value={m} style={{ background: '#0d1526' }}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={step !== 'idle'}
                  placeholder="e.g. Product planning session"
                  className="w-full rounded-xl p-3 text-sm focus:outline-none"
                  style={{ background: '#0d1526', border: '1px solid rgba(0,212,255,0.2)', color: 'rgba(255,255,255,0.85)' }}
                />
              </div>
            </div>

            {/* Privacy toggle */}
            <div className="flex items-center justify-between rounded-xl p-5" style={{ background: '#0d1526', border: '1px solid rgba(0,212,255,0.15)' }}>
              <div>
                <div className="font-semibold mb-0.5" style={{ color: 'white' }}>
                  {isPublic ? '🌐 Public' : '🔒 Private (Sealed Inference)'}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
                  {isPublic ? 'Visible in marketplace. Anyone can load.' : 'Encrypted in 0G TEE. Only you can access.'}
                </p>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className="relative w-12 h-6 rounded-full transition-all flex-shrink-0"
                style={{ background: isPublic ? '#10b981' : 'rgba(255,255,255,0.15)' }}
              >
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: isPublic ? '26px' : '2px' }} />
              </button>
            </div>

            {error && (
              <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                {error}
              </div>
            )}

            {/* Progress indicator while running */}
            {step !== 'idle' && (
              <div className="rounded-xl p-4" style={{ background: '#0d1526', border: '1px solid rgba(0,212,255,0.2)' }}>
                <div className="flex items-center gap-3">
                  <div className="spinner w-4 h-4 border-2 rounded-full flex-shrink-0" style={{ borderColor: 'rgba(0,212,255,0.2)', borderTopColor: '#00d4ff' }} />
                  <span style={{ color: '#00d4ff', fontSize: '0.9rem' }}>{stepLabels[step]}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  {(['storing', 'minting'] as const).map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: step === s ? '#00d4ff' : (
                            (step === 'minting' && i === 0) ? '#10b981' : 'rgba(255,255,255,0.2)'
                          ),
                        }}
                      />
                      <span style={{ fontSize: '0.75rem', color: step === s ? '#00d4ff' : 'rgba(255,255,255,0.4)' }}>
                        {s === 'storing' ? '0G Storage' : '0G Chain'}
                      </span>
                      {i === 0 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>→</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleStore}
              disabled={step !== 'idle' || !content.trim()}
              className="w-full btn-primary text-base py-4 flex items-center justify-center gap-3"
              style={{ opacity: step !== 'idle' || !content.trim() ? 0.6 : 1 }}
            >
              {step !== 'idle' ? (
                <><span className="spinner inline-block w-5 h-5 border-2 rounded-full" style={{ borderColor: '#050a14', borderTopColor: 'transparent' }} /> Processing...</>
              ) : (
                <>🗄️ Store on 0G + Mint NFT</>
              )}
            </button>
          </div>
        )}

        {/* ── Result ── */}
        {step === 'done' && result && (
          <div className="space-y-5 fade-in-up">
            {/* Success */}
            <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <div className="text-4xl mb-3">✅</div>
              <div className="font-black text-xl mb-1" style={{ color: '#10b981' }}>Context Stored & Minted!</div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                Stored on 0G Storage {result.mintTxHash ? '+ minted as NFT on 0G Chain' : '(wallet not connected — no NFT minted)'}
              </p>
            </div>

            {/* Blob ID */}
            <div className="rounded-2xl p-5" style={{ background: '#0d1526', border: '1px solid rgba(0,212,255,0.3)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: '#00d4ff' }}>🆔 BLOB ID (0G Storage Root Hash)</span>
                <button onClick={() => copy(result.contextId, 'blob')} className="text-xs px-3 py-1 rounded-lg" style={{ background: copied === 'blob' ? 'rgba(16,185,129,0.2)' : 'rgba(0,212,255,0.1)', color: copied === 'blob' ? '#10b981' : '#00d4ff', border: `1px solid ${copied === 'blob' ? 'rgba(16,185,129,0.4)' : 'rgba(0,212,255,0.3)'}` }}>
                  {copied === 'blob' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div className="blob-id">{result.contextId}</div>
            </div>

            {/* Chain details */}
            {result.mintTxHash && (
              <div className="rounded-2xl p-5" style={{ background: '#0d1526', border: '1px solid rgba(139,92,246,0.3)' }}>
                <div className="text-xs font-bold mb-3" style={{ color: '#8b5cf6' }}>⛓️ ON-CHAIN OWNERSHIP (0G Chain)</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Token ID</span>
                    <span className="font-mono font-bold" style={{ color: '#8b5cf6' }}>#{result.tokenId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Contract</span>
                    <a href={`${EXPLORER}/address/${contractAddress}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs" style={{ color: '#00d4ff' }}>
                      {contractAddress.slice(0, 10)}...{contractAddress.slice(-6)} ↗
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Mint Tx</span>
                    <a href={`${EXPLORER}/tx/${result.mintTxHash}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs" style={{ color: '#00d4ff' }}>
                      {result.mintTxHash.slice(0, 10)}...{result.mintTxHash.slice(-6)} ↗
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Size', value: `${(result.size / 1024).toFixed(1)} KB` },
                { label: 'Tokens', value: `~${result.tokenCount.toLocaleString()}` },
                { label: 'Privacy', value: result.encrypted ? '🔒 Private' : '🌐 Public' },
                { label: 'Network', value: '0G Galileo' },
              ].map((m, i) => (
                <div key={i} className="rounded-xl p-3 text-center" style={{ background: '#0a0f1e', border: '1px solid rgba(0,212,255,0.1)' }}>
                  <div className="font-bold text-sm" style={{ color: '#00d4ff' }}>{m.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Summary */}
            {result.summary && (
              <div className="rounded-xl p-4" style={{ background: '#0a0f1e', border: '1px solid rgba(139,92,246,0.2)' }}>
                <div className="text-xs font-bold mb-2" style={{ color: '#8b5cf6' }}>AI SUMMARY (via 0G Compute)</div>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', lineHeight: 1.6 }}>{result.summary}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Link href={`/load?id=${result.contextId}`} className="flex-1">
                <button className="w-full btn-secondary py-3">Load This Context →</button>
              </Link>
              <button
                onClick={() => { setResult(null); setContent(''); setDescription(''); setStep('idle'); }}
                className="flex-1 py-3 rounded-xl font-semibold"
                style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
              >
                Store Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
