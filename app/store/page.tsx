'use client';

import { useState } from 'react';
import Link from 'next/link';

const MODELS = ['Claude Sonnet 4.5', 'GPT-4o', 'Gemini 1.5 Pro', 'GLM-5', 'Llama 3.1', 'Mistral Large', 'Custom'];

export default function StorePage() {
  const [content, setContent] = useState('');
  const [model, setModel] = useState('Claude Sonnet 4.5');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    contextId: string;
    txHash: string;
    size: number;
    summary: string;
    encrypted: boolean;
    tokenCount: number;
  } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleStore = async () => {
    if (!content.trim()) {
      setError('Please paste your agent context or conversation.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/context/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          modelName: model,
          description,
          isPublic,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to store context');
      }

      setResult({
        contextId: data.contextId,
        txHash: data.txHash,
        size: data.metadata.size,
        summary: data.metadata.summary,
        encrypted: data.metadata.encrypted,
        tokenCount: data.metadata.tokenCount,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to store context. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: '#050a14', minHeight: '100vh', paddingTop: '80px' }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="text-sm mb-4 inline-flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            ← Back to home
          </Link>
          <h1 className="font-black text-4xl mb-3" style={{ color: 'white' }}>
            Store <span className="gradient-text">Context</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem' }}>
            Paste your AI conversation or agent memory. It gets stored on 0G Storage and you receive a portable blob ID.
          </p>
        </div>

        {/* Form */}
        {!result && (
          <div className="space-y-6">
            {/* Context Input */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Agent Context / Conversation *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your AI conversation, system prompt, agent memory, task history, or any context you want to make portable..."
                rows={12}
                className="w-full rounded-xl p-4 text-sm font-mono resize-none focus:outline-none"
                style={{
                  background: '#0d1526',
                  border: '1px solid rgba(0,212,255,0.2)',
                  color: 'rgba(255,255,255,0.85)',
                  lineHeight: 1.6,
                  caretColor: '#00d4ff',
                }}
              />
              <div className="flex justify-between mt-1">
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                  {content.length.toLocaleString()} characters · ~{Math.ceil(content.length / 4).toLocaleString()} tokens
                </span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                  Max 1MB
                </span>
              </div>
            </div>

            {/* Model + Description row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  AI Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-xl p-3 text-sm focus:outline-none"
                  style={{
                    background: '#0d1526',
                    border: '1px solid rgba(0,212,255,0.2)',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                >
                  {MODELS.map((m) => (
                    <option key={m} value={m} style={{ background: '#0d1526' }}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Product roadmap planning session"
                  className="w-full rounded-xl p-3 text-sm focus:outline-none"
                  style={{
                    background: '#0d1526',
                    border: '1px solid rgba(0,212,255,0.2)',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                />
              </div>
            </div>

            {/* Privacy Toggle */}
            <div
              className="flex items-center justify-between rounded-xl p-5"
              style={{ background: '#0d1526', border: '1px solid rgba(0,212,255,0.15)' }}
            >
              <div>
                <div className="font-semibold mb-0.5" style={{ color: 'white' }}>
                  {isPublic ? '🌐 Public Context' : '🔒 Private Context (Sealed Inference)'}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)' }}>
                  {isPublic
                    ? 'Visible in the marketplace. Anyone can load this context.'
                    : 'Encrypted inside 0G TEE. Only you can access it with the blob ID.'}
                </p>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className="relative w-12 h-6 rounded-full transition-all flex-shrink-0"
                style={{ background: isPublic ? '#10b981' : 'rgba(255,255,255,0.15)' }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                  style={{ left: isPublic ? '26px' : '2px' }}
                />
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleStore}
              disabled={loading || !content.trim()}
              className="w-full btn-primary text-base py-4 flex items-center justify-center gap-3"
              style={{ opacity: loading || !content.trim() ? 0.6 : 1 }}
            >
              {loading ? (
                <>
                  <span className="spinner inline-block w-5 h-5 border-2 rounded-full" style={{ borderColor: '#050a14', borderTopColor: '#050a14' }} />
                  Storing on 0G Storage...
                </>
              ) : (
                <>🗄️ Store on 0G Storage</>
              )}
            </button>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="space-y-5 fade-in-up">
            {/* Success banner */}
            <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <div className="text-4xl mb-3">✅</div>
              <div className="font-black text-xl mb-1" style={{ color: '#10b981' }}>Context Stored on 0G!</div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                {result.encrypted ? 'Encrypted via Sealed Inference — nobody can read this data except you.' : 'Stored publicly on 0G Storage.'}
              </p>
            </div>

            {/* Blob ID */}
            <div className="rounded-2xl p-6" style={{ background: '#0d1526', border: '1px solid rgba(0,212,255,0.3)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold" style={{ color: '#00d4ff' }}>🆔 YOUR BLOB ID (Context ID)</span>
                <button
                  onClick={() => copyToClipboard(result.contextId)}
                  className="text-xs px-3 py-1 rounded-lg transition-all"
                  style={{ background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(0,212,255,0.1)', color: copied ? '#10b981' : '#00d4ff', border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'rgba(0,212,255,0.3)'}` }}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <div className="blob-id">{result.contextId}</div>
              <p className="mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Share this ID with any agent or AI model to load your full context instantly.
              </p>
            </div>

            {/* Metadata */}
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
                onClick={() => { setResult(null); setContent(''); setDescription(''); }}
                className="flex-1 py-3 rounded-xl font-semibold transition-all"
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
