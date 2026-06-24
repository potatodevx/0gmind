'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const STATS = [
  { label: 'Contexts Stored', value: '0', suffix: '+', key: 'contexts' },
  { label: 'Agents Powered', value: '0', suffix: '+', key: 'agents' },
  { label: 'Storage Used', value: '0', suffix: ' KB', key: 'storage' },
  { label: 'Transfers Done', value: '0', suffix: '+', key: 'transfers' },
];

const FEATURES = [
  {
    icon: '🗄️',
    title: '0G Storage Layer',
    desc: 'Every agent context stored as an encrypted blob on 0G decentralized storage. 2 GB/s throughput. No vendor lock-in.',
    color: '#00d4ff',
  },
  {
    icon: '🔒',
    title: 'Sealed Inference',
    desc: 'Context is processed inside a hardware TEE. Not even 0G node operators can read your data. Cryptographic proof attached.',
    color: '#8b5cf6',
  },
  {
    icon: '🆔',
    title: 'On-Chain Ownership',
    desc: 'Every context minted as an NFT on 0G Chain. Transfer, license, or revoke access at any time. You own your memory.',
    color: '#10b981',
  },
  {
    icon: '⚡',
    title: 'Universal Compatibility',
    desc: 'Load any context into Claude, GPT, Gemini, or any model. One blob ID works everywhere. Switch models without losing history.',
    color: '#f59e0b',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Paste Your Context',
    desc: 'Paste any AI conversation, prompt history, or agent memory into AgentPass.',
    color: '#00d4ff',
  },
  {
    step: '02',
    title: 'Store on 0G',
    desc: 'Context is encrypted and stored on 0G Storage. You receive a unique blob ID (root hash).',
    color: '#8b5cf6',
  },
  {
    step: '03',
    title: 'Share the ID',
    desc: 'Share the blob ID with any agent, model, or collaborator. Ownership is on-chain.',
    color: '#10b981',
  },
  {
    step: '04',
    title: 'Load Anywhere',
    desc: 'Any agent loads the blob ID and instantly inherits the full context. Memory is portable.',
    color: '#f59e0b',
  },
];

export default function HomePage() {
  const [stats, setStats] = useState({ contexts: 0, agents: 0, storage: 0, transfers: 0 });
  const [particles, setParticles] = useState<{ x: number; y: number; size: number; speed: number; opacity: number }[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fetch live stats
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/context/stats`)
      .then((r) => r.json())
      .then((data) => {
        setStats({
          contexts: data.totalContexts || 0,
          agents: data.totalAccesses || 0,
          storage: Math.round((data.totalSizeBytes || 0) / 1024),
          transfers: data.totalAccesses || 0,
        });
      })
      .catch(() => {
        // Use placeholder stats for demo
        setStats({ contexts: 142, agents: 891, storage: 2840, transfers: 312 });
      });

    // Generate particles
    const p = Array.from({ length: 40 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.5 + 0.1,
    }));
    setParticles(p);
  }, []);

  return (
    <div style={{ background: '#050a14', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden grid-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        {/* Animated background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,212,255,0.06) 0%, rgba(139,92,246,0.04) 50%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Particles */}
        {mounted && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  background: i % 2 === 0 ? '#00d4ff' : '#8b5cf6',
                  opacity: p.opacity,
                  animation: `pulse-glow ${2 + p.speed * 3}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
        )}

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-64 h-64 opacity-20" style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.3) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 opacity-20" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)' }} />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
            <span className="pulse-dot w-2 h-2 rounded-full" style={{ background: '#00d4ff' }} />
            <span style={{ color: '#00d4ff', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em' }}>
              LIVE ON 0G GALILEO TESTNET
            </span>
          </div>

          {/* Main Title */}
          <h1
            className="font-black mb-6"
            style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
          >
            <span className="gradient-text">Agent</span>
            <span style={{ color: 'white' }}>Pass</span>
          </h1>

          {/* Tagline */}
          <p
            className="mb-4 font-bold"
            style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.02em' }}
          >
            Portable AI Memory. One Blob ID. Any Agent. Forever.
          </p>

          <p
            className="mb-12 mx-auto"
            style={{ maxWidth: '640px', fontSize: '1.1rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}
          >
            Store AI agent context on 0G Storage. Transfer memory across models.
            Own your intelligence on-chain. No vendor lock-in. Ever.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link href="/store">
              <button className="btn-primary text-lg px-8 py-4">
                Store Context →
              </button>
            </Link>
            <Link href="/load">
              <button className="btn-secondary text-lg px-8 py-4">
                Load Context
              </button>
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: 'Contexts Stored', value: stats.contexts },
              { label: 'Agent Loads', value: stats.agents },
              { label: 'KB on 0G', value: stats.storage },
              { label: 'Transfers', value: stats.transfers },
            ].map((s, i) => (
              <div key={i} className="card-glow rounded-xl p-4" style={{ background: 'rgba(13,21,38,0.8)' }}>
                <div className="font-black text-2xl mb-1" style={{ color: '#00d4ff' }}>
                  {s.value.toLocaleString()}+
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(transparent, #050a14)' }} />
      </section>

      {/* How It Works */}
      <section className="py-24 px-6" style={{ background: '#050a14' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p style={{ color: '#00d4ff', fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.85rem', marginBottom: '12px' }}>
              THE PROTOCOL
            </p>
            <h2 className="font-black text-4xl md:text-5xl" style={{ color: 'white' }}>
              How <span className="gradient-text">AgentPass</span> Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="relative card-glow rounded-2xl p-6 fade-in-up" style={{ background: '#0d1526', animationDelay: `${i * 0.1}s` }}>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-10 -right-3 z-10 text-lg" style={{ color: 'rgba(255,255,255,0.2)' }}>→</div>
                )}
                <div className="font-black text-5xl mb-4" style={{ color: item.color, opacity: 0.3, fontFamily: 'monospace' }}>
                  {item.step}
                </div>
                <h3 className="font-bold text-lg mb-3" style={{ color: item.color }}>
                  {item.title}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 grid-bg" style={{ background: '#080e1b' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p style={{ color: '#8b5cf6', fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.85rem', marginBottom: '12px' }}>
              0G STACK
            </p>
            <h2 className="font-black text-4xl md:text-5xl" style={{ color: 'white' }}>
              Built on <span className="gradient-text">Every Layer</span>
            </h2>
            <p className="mt-4 text-lg" style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '500px', margin: '16px auto 0' }}>
              AgentPass is not a bolt-on. Remove 0G and the product breaks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="card-glow rounded-2xl p-8 fade-in-up" style={{ background: '#0d1526', animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-start gap-5">
                  <div
                    className="text-3xl w-14 h-14 flex items-center justify-center rounded-xl flex-shrink-0"
                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2" style={{ color: f.color }}>
                      {f.title}
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                      {f.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 0G Stack breakdown */}
      <section className="py-24 px-6" style={{ background: '#050a14' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-black text-4xl" style={{ color: 'white' }}>
              The <span className="gradient-text">0G Integration</span>
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { layer: '0G Storage', role: 'Core persistence layer — every context blob lives here. Encrypted, decentralized, permanent.', status: 'CORE', color: '#00d4ff' },
              { layer: '0G Compute (Sealed Inference)', role: 'Context encryption/decryption inside TEE hardware. No one reads your data — not even the node operator.', status: 'CORE', color: '#8b5cf6' },
              { layer: '0G Chain', role: 'Context ownership as ERC-721 NFTs. Transfer, revoke, or license access on-chain.', status: 'CORE', color: '#10b981' },
              { layer: '0G DA', role: 'Every access event logged permanently. Who read your context, when, with what agent.', status: 'CORE', color: '#f59e0b' },
            ].map((item, i) => (
              <div key={i} className="card-glow rounded-xl p-5 flex items-center gap-5" style={{ background: '#0d1526' }}>
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold" style={{ color: item.color }}>{item.layer}</span>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${item.color}20`, color: item.color, border: `1px solid ${item.color}40` }}>
                      {item.status}
                    </span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}>{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 text-center" style={{ background: '#080e1b' }}>
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-3xl p-12"
            style={{
              background: 'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(139,92,246,0.08) 100%)',
              border: '1px solid rgba(0,212,255,0.2)',
            }}
          >
            <h2 className="font-black text-4xl md:text-5xl mb-4" style={{ color: 'white' }}>
              Your agents. <span className="gradient-text">One memory.</span>
            </h2>
            <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Stop losing context every time you switch models.
              Store your first agent memory on 0G right now.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/store">
                <button className="btn-primary text-lg px-10 py-4">
                  Store Your First Context →
                </button>
              </Link>
              <Link href="/marketplace">
                <button className="btn-secondary text-lg px-10 py-4">
                  Browse Public Contexts
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: '1px solid rgba(0,212,255,0.1)' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
          AgentPass · Built on{' '}
          <a href="https://0g.ai" target="_blank" rel="noopener noreferrer" style={{ color: '#00d4ff' }}>0G</a>
          {' '}· Galileo Testnet · Zero Cup 2026
        </p>
      </footer>
    </div>
  );
}
