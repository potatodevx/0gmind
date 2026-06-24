'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IconBox, IconChat, IconLock, IconGlobe } from '@/components/ui/icons';

const MODELS = ['Claude Sonnet 4.5', 'GPT-4o', 'Gemini 1.5 Pro', 'GLM-5', 'Llama 3.1', 'Custom'];

function LoadContextContent() {
  const searchParams = useSearchParams();
  const [contextId, setContextId] = useState(searchParams.get('id') || '');
  const [query, setQuery] = useState('');
  const [targetModel, setTargetModel] = useState('Claude Sonnet 4.5');
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [context, setContext] = useState<{
    content: string;
    metadata: { model: string; description: string; isPublic: boolean; createdAt: number; summary?: string };
  } | null>(null);
  const [chatResponse, setChatResponse] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setContextId(id);
    }
  }, [searchParams]);

  const handleLoad = async () => {
    if (!contextId.trim()) {
      setError('Please enter a Context ID (blob ID).');
      return;
    }
    setLoading(true);
    setError('');
    setContext(null);
    setChatResponse('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/context/load`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contextId: contextId.trim() }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setContext({ content: data.content, metadata: data.metadata });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load context');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!query.trim() || !contextId) return;
    setChatLoading(true);
    setChatResponse('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/context/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contextId: contextId.trim(), query }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setChatResponse(data.response);
    } catch (err: unknown) {
      setChatResponse('Failed to get response from 0G Compute.');
    } finally {
      setChatLoading(false);
    }
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div style={{ background: '#E6F0FF', minHeight: '100vh', paddingTop: '80px' }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <Link href="/" className="text-sm mb-4 inline-flex items-center gap-2" style={{ color: 'rgba(11,27,46,0.5)' }}>
            ← Back to home
          </Link>
          <h1 className="font-black text-4xl mb-3" style={{ color: '#0B1B2E' }}>
            Load <span className="gradient-text">Context</span>
          </h1>
          <p style={{ color: 'rgba(11,27,46,0.55)', fontSize: '1.05rem' }}>
            Enter a blob ID to load any agent context from 0G Storage into any model.
          </p>
        </div>

        {/* Input Section */}
        <div className="space-y-5 mb-8">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(11,27,46,0.7)' }}>
              Context ID (Blob ID) *
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={contextId}
                onChange={(e) => setContextId(e.target.value)}
                placeholder="0x3f9a...b72c — paste your context blob ID here"
                className="flex-1 rounded-xl p-3 text-sm font-mono focus:outline-none"
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(0,145,255,0.2)',
                  color: '#0091ff',
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
              />
              <button
                onClick={handleLoad}
                disabled={loading || !contextId.trim()}
                className="btn-primary px-6 py-3 flex items-center gap-2 shrink-0"
                style={{ opacity: loading || !contextId.trim() ? 0.6 : 1 }}
              >
                {loading ? (
                  <span className="spinner inline-block w-4 h-4 border-2 rounded-full" style={{ borderColor: '#E6F0FF', borderTopColor: 'transparent' }} />
                ) : '→'}
                {loading ? 'Loading...' : 'Load'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(11,27,46,0.7)' }}>
              Target Model
            </label>
            <select
              value={targetModel}
              onChange={(e) => setTargetModel(e.target.value)}
              className="w-full rounded-xl p-3 text-sm focus:outline-none"
              style={{ background: '#ffffff', border: '1px solid rgba(0,145,255,0.2)', color: 'rgba(11,27,46,0.85)' }}
            >
              {MODELS.map((m) => (
                <option key={m} value={m} style={{ background: '#ffffff' }}>{m}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#dc2626' }}>
              {error}
            </div>
          )}
        </div>

        {/* Loaded Context */}
        {context && (
          <div className="space-y-5 fade-in-up">
            {/* Success Banner */}
            <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <div style={{ color: '#059669' }}><IconBox size={30} /></div>
              <div>
                <div className="font-bold" style={{ color: '#059669' }}>Context Loaded from 0G Storage</div>
                <p style={{ color: 'rgba(11,27,46,0.5)', fontSize: '0.85rem' }}>
                  Ready to inject into {targetModel} · Stored at {new Date(context.metadata.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Source Model', value: context.metadata.model },
                { label: 'Privacy', value: context.metadata.isPublic ? (<span className="inline-flex items-center gap-1"><IconGlobe size={12} /> Public</span>) : (<span className="inline-flex items-center gap-1"><IconLock size={12} /> Private</span>) },
                { label: 'Description', value: context.metadata.description || '—' },
                { label: 'Network', value: '0G Galileo' },
              ].map((m, i) => (
                <div key={i} className="rounded-xl p-3" style={{ background: '#F2F7FF', border: '1px solid rgba(0,145,255,0.1)' }}>
                  <div className="font-bold text-xs truncate" style={{ color: '#0091ff' }}>{m.value}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(11,27,46,0.5)', marginTop: '2px' }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Context Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: 'rgba(11,27,46,0.55)' }}>CONTEXT PREVIEW</span>
                <button
                  onClick={() => copy(context.content, 'ctx')}
                  className="text-xs px-3 py-1 rounded-lg"
                  style={{ background: copied === 'ctx' ? 'rgba(16,185,129,0.2)' : 'rgba(0,145,255,0.1)', color: copied === 'ctx' ? '#059669' : '#0091ff', border: `1px solid ${copied === 'ctx' ? 'rgba(16,185,129,0.4)' : 'rgba(0,145,255,0.3)'}` }}
                >
                  {copied === 'ctx' ? '✓ Copied' : 'Copy Context'}
                </button>
              </div>
              <pre
                className="rounded-xl p-4 text-xs overflow-auto"
                style={{ background: '#ffffff', border: '1px solid rgba(0,145,255,0.15)', color: 'rgba(11,27,46,0.7)', maxHeight: '200px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'Courier New, monospace', lineHeight: 1.6 }}
              >
                {context.content.slice(0, 1000)}{context.content.length > 1000 ? '\n\n... [truncated for preview]' : ''}
              </pre>
            </div>

            {/* Chat with Context */}
            <div className="rounded-2xl p-6" style={{ background: '#ffffff', border: '1px solid rgba(139,92,246,0.3)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-bold inline-flex items-center gap-1.5" style={{ color: '#8b5cf6' }}><IconChat size={15} /> CHAT USING THIS CONTEXT (via 0G Compute)</span>
              </div>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Ask ${targetModel} using this context...`}
                  className="flex-1 rounded-xl p-3 text-sm focus:outline-none"
                  style={{ background: '#F2F7FF', border: '1px solid rgba(139,92,246,0.2)', color: 'rgba(11,27,46,0.85)' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                />
                <button
                  onClick={handleChat}
                  disabled={chatLoading || !query.trim()}
                  className="px-5 py-3 rounded-xl font-semibold transition-all shrink-0"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#0B1B2E', opacity: chatLoading || !query.trim() ? 0.6 : 1 }}
                >
                  {chatLoading ? '...' : 'Ask'}
                </button>
              </div>

              {chatResponse && (
                <div className="rounded-xl p-4" style={{ background: '#F2F7FF', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <div className="text-xs font-bold mb-2" style={{ color: '#8b5cf6' }}>RESPONSE (0G Compute + Loaded Context)</div>
                  <p style={{ color: 'rgba(11,27,46,0.8)', fontSize: '0.9rem', lineHeight: 1.7 }}>{chatResponse}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoadPage() {
  return (
    <Suspense fallback={<div style={{ background: '#E6F0FF', minHeight: '100vh' }} />}>
      <LoadContextContent />
    </Suspense>
  );
}
