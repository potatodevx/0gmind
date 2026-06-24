'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconGlobe } from '@/components/ui/icons';
import { useContextRegistry } from '@/components/chain/useContextRegistry';

interface PublicContext {
  contextId: string;
  model: string;
  description: string;
  summary: string;
  size: number;
  timestamp: number;
  accessCount: number;
}

const MODEL_COLORS: Record<string, string> = {
  'GLM-5 (0G Compute)': '#0091ff',
  'Claude Sonnet 4.5': '#8b5cf6',
  'GPT-4o': '#0091ff',
  'Gemini 1.5 Pro': '#8b5cf6',
  'GLM-5': '#0091ff',
  'Llama 3.1': '#8b5cf6',
  'Mistral Large': '#0091ff',
  'Custom': 'rgba(11,27,46,0.45)',
};

export default function MarketplacePage() {
  const { getAllPublicContexts } = useContextRegistry();
  const [contexts, setContexts] = useState<PublicContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const allModels = ['All', 'GLM-5 (0G Compute)', 'Claude Sonnet 4.5', 'GPT-4o', 'Gemini 1.5 Pro', 'Llama 3.1', 'Custom'];

  useEffect(() => {
    // Source of truth = on-chain public contexts (persistent). Enrich with
    // backend summary / load count when available.
    Promise.allSettled([
      getAllPublicContexts(),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/context/list`).then((r) => r.json()),
    ])
      .then(([chainRes, apiRes]) => {
        const apiList = apiRes.status === 'fulfilled' ? (apiRes.value.contexts || []) : [];
        const apiByBlob = new Map<string, { summary: string; accessCount: number }>(
          apiList.map((c: { contextId: string; summary: string; accessCount: number }) => [c.contextId.toLowerCase(), { summary: c.summary, accessCount: c.accessCount }])
        );

        if (chainRes.status === 'fulfilled' && chainRes.value.length > 0) {
          const merged: PublicContext[] = chainRes.value.map((c) => {
            const extra = apiByBlob.get(c.blobId.toLowerCase());
            return {
              contextId: c.blobId,
              model: c.modelName,
              description: c.description,
              summary: extra?.summary || '',
              size: c.sizeBytes,
              timestamp: c.createdAt,
              accessCount: extra?.accessCount || 0,
            };
          });
          setContexts(merged);
        } else {
          // fallback to backend-only list if chain read returns nothing
          setContexts(apiList);
        }
      })
      .catch(() => setContexts([]))
      .finally(() => setLoading(false));
  }, [getAllPublicContexts]);

  const filtered = contexts.filter((c) => {
    const matchSearch = !search || c.description?.toLowerCase().includes(search.toLowerCase()) || c.summary?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || c.model === filter;
    return matchSearch && matchFilter;
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div style={{ background: '#E6F0FF', minHeight: '100vh', paddingTop: '80px' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-black text-5xl mb-4" style={{ color: '#0B1B2E' }}>
            Context <span style={{ color: '#0091ff' }}>Marketplace</span>
          </h1>
          <p style={{ color: 'rgba(11,27,46,0.55)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
            Browse public agent contexts stored on 0G. Load any context into your preferred AI model instantly.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contexts..."
            className="flex-1 rounded-xl p-3 text-sm focus:outline-none"
            style={{ background: '#ffffff', border: '1px solid rgba(0,145,255,0.2)', color: 'rgba(11,27,46,0.85)' }}
          />
          <div className="flex gap-2 flex-wrap">
            {allModels.map((m) => (
              <button
                key={m}
                onClick={() => setFilter(m)}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: filter === m ? 'rgba(0,145,255,0.15)' : '#ffffff',
                  color: filter === m ? '#0091ff' : 'rgba(11,27,46,0.55)',
                  border: `1px solid ${filter === m ? 'rgba(0,145,255,0.4)' : 'rgba(11,27,46,0.12)'}`,
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20" style={{ color: 'rgba(11,27,46,0.4)' }}>
            <div className="spinner inline-block w-8 h-8 border-2 rounded-full mb-4" style={{ borderColor: 'rgba(0,145,255,0.2)', borderTopColor: '#0091ff' }} />
            <div>Fetching from 0G...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-4 flex justify-center" style={{ color: '#0091ff' }}><IconGlobe size={44} /></div>
            <div className="font-bold text-xl mb-2" style={{ color: 'rgba(11,27,46,0.55)' }}>
              {search || filter !== 'All' ? 'No matching contexts' : 'Marketplace is empty'}
            </div>
            <p style={{ color: 'rgba(11,27,46,0.4)', marginBottom: '24px' }}>
              {search ? 'Try a different search term.' : 'Store a public context to be the first listing.'}
            </p>
            <Link href="/store"><button className="btn-primary">Add to Marketplace</button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((ctx) => {
              const modelColor = MODEL_COLORS[ctx.model] || '#64748b';
              return (
                <div key={ctx.contextId} className="card-glow rounded-2xl p-5 flex flex-col" style={{ background: '#ffffff' }}>
                  {/* Model badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: `${modelColor}20`, color: modelColor, border: `1px solid ${modelColor}40` }}
                    >
                      {ctx.model}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(11,27,46,0.4)' }}>
                      {ctx.accessCount} loads
                    </span>
                  </div>

                  {/* Description */}
                  <h3 className="font-bold mb-2" style={{ color: '#0B1B2E' }}>
                    {ctx.description || 'Untitled Context'}
                  </h3>

                  {/* Summary */}
                  <p style={{ fontSize: '0.85rem', color: 'rgba(11,27,46,0.55)', lineHeight: 1.55, flexGrow: 1, marginBottom: '16px' }}>
                    {ctx.summary
                      ? ctx.summary.slice(0, 120) + (ctx.summary.length > 120 ? '...' : '')
                      : 'No summary available.'}
                  </p>

                  {/* Blob ID preview */}
                  <div className="blob-id text-xs mb-4 truncate">
                    {ctx.contextId.slice(0, 32)}...
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: '0.75rem', color: 'rgba(11,27,46,0.45)' }}>
                      {formatSize(ctx.size)}
                    </span>
                    <Link href={`/load?id=${ctx.contextId}`}>
                      <button className="btn-secondary text-xs px-4 py-2">Load Context →</button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
