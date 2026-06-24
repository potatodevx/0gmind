'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ContextMeta {
  contextId: string;
  model: string;
  description: string;
  summary: string;
  size: number;
  timestamp: number;
  accessCount: number;
}

export default function DashboardPage() {
  const [contexts, setContexts] = useState<ContextMeta[]>([]);
  const [stats, setStats] = useState({ total: 0, public: 0, private: 0, accesses: 0 });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    Promise.all([
      fetch(`${API}/api/context/list`).then((r) => r.json()),
      fetch(`${API}/api/context/stats`).then((r) => r.json()),
    ])
      .then(([listData, statsData]) => {
        setContexts(listData.contexts || []);
        setStats({
          total: statsData.totalContexts || 0,
          public: statsData.publicContexts || 0,
          private: statsData.privateContexts || 0,
          accesses: statsData.totalAccesses || 0,
        });
      })
      .catch(() => {
        setContexts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div style={{ background: '#050a14', minHeight: '100vh', paddingTop: '80px' }}>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-black text-4xl mb-2" style={{ color: 'white' }}>
              <span className="gradient-text">Dashboard</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>All contexts stored on 0G Storage</p>
          </div>
          <Link href="/store">
            <button className="btn-primary">+ Store New</button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Contexts', value: stats.total, color: '#00d4ff' },
            { label: 'Public', value: stats.public, color: '#10b981' },
            { label: 'Private', value: stats.private, color: '#8b5cf6' },
            { label: 'Total Accesses', value: stats.accesses, color: '#f59e0b' },
          ].map((s, i) => (
            <div key={i} className="card-glow rounded-xl p-5 text-center" style={{ background: '#0d1526' }}>
              <div className="font-black text-3xl mb-1" style={{ color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Context List */}
        {loading ? (
          <div className="text-center py-20" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <div className="spinner inline-block w-8 h-8 border-2 rounded-full mb-4" style={{ borderColor: 'rgba(0,212,255,0.2)', borderTopColor: '#00d4ff' }} />
            <div>Loading from 0G...</div>
          </div>
        ) : contexts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🗄️</div>
            <div className="font-bold text-xl mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>No public contexts yet</div>
            <p style={{ color: 'rgba(255,255,255,0.3)', marginBottom: '24px' }}>Be the first to store a context on 0G</p>
            <Link href="/store"><button className="btn-primary">Store First Context</button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {contexts.map((ctx) => (
              <div key={ctx.contextId} className="card-glow rounded-2xl p-5" style={{ background: '#0d1526' }}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold" style={{ color: 'white' }}>
                        {ctx.description || 'Untitled Context'}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
                      >
                        Public
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                      {ctx.summary || 'No summary available.'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Link href={`/load?id=${ctx.contextId}`}>
                      <button className="btn-secondary text-xs px-4 py-2">Load →</button>
                    </Link>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="blob-id text-xs px-2 py-1 truncate max-w-xs">
                    {ctx.contextId.slice(0, 24)}...
                  </div>
                  <button
                    onClick={() => copy(ctx.contextId, ctx.contextId)}
                    className="text-xs px-2 py-1 rounded transition-all"
                    style={{ color: copied === ctx.contextId ? '#10b981' : 'rgba(255,255,255,0.4)' }}
                  >
                    {copied === ctx.contextId ? '✓ Copied' : 'Copy ID'}
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>
                    {ctx.model} · {formatSize(ctx.size)} · {ctx.accessCount} loads · {timeAgo(ctx.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
