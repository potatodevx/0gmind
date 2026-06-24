'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';

const MemoryCore = dynamic(
  () => import('@/components/ui/MemoryCore').then((m) => ({ default: m.MemoryCore })),
  { ssr: false }
);

const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTEXT_REGISTRY_ADDRESS ||
  '0x958a498B4f1Bd1F197BC177F8398e656efD44422';
const EXPLORER = process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://chainscan-galileo.0g.ai';
const CONTRACT_URL = `${EXPLORER}/address/${CONTRACT_ADDRESS}`;

function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="88" height="88" rx="24" fill="#9200E1" />
      <text x="50" y="66" textAnchor="middle" fontSize="42" fontWeight="900" fill="#ffffff" fontFamily="Inter, sans-serif">0G</text>
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="bg-white text-[#0A0A0A]">
      {/* ════════════════ HERO SCREEN ════════════════ */}
      <div className="relative h-screen w-full overflow-hidden bg-white">
        {/* ── Top navbar ── */}
        <header className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-6 sm:px-10 h-[76px]">
          <Link href="/" className="flex items-center gap-2.5">
            <Mark size={28} />
            <span className="font-black tracking-widest text-black text-sm">0G MIND</span>
            <span className="text-[#9200E1] text-[11px] font-mono px-2 py-0.5 rounded-full border border-[#9200E1]/40 bg-[#9200E1]/5">
              GALILEO
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:inline-block text-black rounded-full px-4 py-2 text-xs font-black tracking-wide hover:bg-black/5 transition-colors border border-black/15"
            >
              DASHBOARD
            </Link>
            <Link
              href="/store"
              className="bg-[#9200E1] text-white rounded-full px-5 py-2 text-sm font-black hover:opacity-90 transition-opacity"
            >
              Store Context
            </Link>
          </div>
        </header>

        {/* ── Hero card ── */}
        <div
          className="absolute inset-x-4 sm:inset-x-8 top-[84px] bottom-6 rounded-[28px] border-[6px] border-black overflow-hidden shadow-2xl"
          style={{ background: 'linear-gradient(160deg, #FBF6FF 0%, #F2E6FF 100%)' }}
        >
          {/* 3D memory core */}
          <div className="absolute inset-0 z-0">
            <MemoryCore />
          </div>

          {/* subtle grid */}
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-50"
            style={{
              backgroundImage:
                'linear-gradient(rgba(146,0,225,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(146,0,225,0.05) 1px, transparent 1px)',
              backgroundSize: '52px 52px',
              maskImage: 'radial-gradient(ellipse 85% 85% at 50% 50%, black 40%, transparent 100%)',
            }}
          />

          {/* Title — top left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute top-7 left-7 sm:top-10 sm:left-10 z-10 max-w-[75%] pointer-events-none"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="h-px w-8 bg-black" />
              <span className="text-[#9200E1] font-bold tracking-[0.25em] text-[10px] sm:text-[11px]">
                0G GALILEO · PORTABLE AI MEMORY
              </span>
            </div>
            <span className="inline-block bg-[#9200E1] text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-2xl text-4xl sm:text-7xl font-black leading-none mb-4">
              0G MIND
            </span>
            <p className="text-black text-2xl sm:text-5xl font-black leading-[0.95]">One Blob ID.</p>
            <p className="text-black/50 text-2xl sm:text-5xl font-black leading-[0.95]">Any Agent. Forever.</p>
          </motion.div>

          {/* Content / CTA card — bottom right */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="absolute bottom-7 right-4 left-4 sm:left-auto sm:bottom-10 sm:right-10 z-10 sm:w-[390px] rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.85)', border: '2px solid rgba(0,0,0,0.1)', backdropFilter: 'blur(8px)' }}
          >
            <p className="inline-block text-[#9200E1] bg-[#9200E1]/10 px-4 py-1 rounded-full text-sm font-semibold mb-3">
              Memory that outlives the model
            </p>
            <p className="text-black/70 text-[13px] leading-relaxed mb-4">
              Store any AI agent&apos;s context on <span className="font-bold text-black">0G Storage</span>.
              Hand off a single <span className="font-bold text-black">blob ID</span> and any model instantly
              inherits the full memory — encrypted, owned on-chain, portable forever.
            </p>
            <Link href="/store">
              <button className="w-full bg-[#9200E1] text-white py-3 rounded-full font-black text-lg tracking-wide hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v4H4zM4 10h16v10H4zm3 3v4h10v-4z" /></svg>
                STORE CONTEXT
              </button>
            </Link>
            <div className="flex gap-2 mt-2">
              <Link href="/load" className="flex-1 text-center bg-black/5 border border-black/10 text-black py-2 rounded-full text-xs font-bold hover:bg-black/10 transition-colors">
                LOAD CONTEXT
              </Link>
              <a href={CONTRACT_URL} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-black/5 border border-black/10 text-black py-2 rounded-full text-xs font-bold hover:bg-black/10 transition-colors">
                CONTRACT ↗
              </a>
            </div>
          </motion.div>

          {/* Footer pill — bottom left */}
          <div className="hidden sm:flex absolute bottom-4 left-7 sm:left-10 z-10 items-center gap-2 text-[11px] text-black/50">
            <span>Powered by</span>
            <Mark size={14} />
            <span className="font-bold text-black/70">0G</span>
            <span>· 2 GB/s storage · sub-second finality</span>
          </div>
        </div>
      </div>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section className="px-6 sm:px-10 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-8 bg-black" />
            <span className="text-[#9200E1] font-bold tracking-[0.25em] text-[11px]">THE PROTOCOL</span>
          </div>
          <h2 className="text-black text-4xl sm:text-5xl font-black mb-12">How it works</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { step: '01', title: 'Paste your context', desc: 'Drop in any AI conversation, system prompt, or agent memory.' },
              { step: '02', title: 'Store on 0G', desc: 'Encrypted and written to 0G Storage. You get a unique blob ID.' },
              { step: '03', title: 'Mint ownership', desc: 'A context NFT is minted on 0G Chain. You own the memory.' },
              { step: '04', title: 'Load anywhere', desc: 'Any agent loads the blob ID and inherits the full context instantly.' },
            ].map((item) => (
              <div key={item.step} className="rounded-3xl border-[3px] border-black bg-white p-6 hover:bg-[#FBF6FF] transition-colors">
                <div className="text-[#9200E1] font-black text-5xl mb-4 font-mono">{item.step}</div>
                <h3 className="text-black font-black text-lg mb-2">{item.title}</h3>
                <p className="text-black/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ 0G STACK ════════════════ */}
      <section className="px-6 sm:px-10 py-20" style={{ background: '#F6ECFF' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-8 bg-black" />
            <span className="text-[#9200E1] font-bold tracking-[0.25em] text-[11px]">THE 0G STACK</span>
          </div>
          <h2 className="text-black text-4xl sm:text-5xl font-black mb-3">Built on every layer</h2>
          <p className="text-black/55 text-base mb-12 max-w-xl">
            0G Mind is not a bolt-on. Remove any layer and the product breaks.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { layer: '0G Storage', role: 'Every context blob lives here. Encrypted, decentralized, permanent.', icon: '🗄️' },
              { layer: '0G Compute', role: 'Sealed inference inside a TEE. No one reads your data — not even node operators.', icon: '🔒' },
              { layer: '0G Chain', role: 'Context ownership as ERC-721 NFTs. Transfer, license, or revoke on-chain.', icon: '⛓️' },
              { layer: '0G DA', role: 'Every access logged permanently. Full audit trail of who used your memory.', icon: '📊' },
            ].map((item) => (
              <div key={item.layer} className="rounded-3xl border-[3px] border-black bg-white p-6 flex items-start gap-4 hover:bg-[#FBF6FF] transition-colors">
                <div className="text-2xl w-12 h-12 flex items-center justify-center rounded-2xl bg-[#9200E1]/10 border border-[#9200E1]/20 shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-black font-black">{item.layer}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#9200E1]/15 text-[#9200E1] border border-[#9200E1]/25">CORE</span>
                  </div>
                  <p className="text-black/60 text-sm leading-relaxed">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ CTA ════════════════ */}
      <section className="px-6 sm:px-10 py-20 bg-white">
        <div
          className="max-w-5xl mx-auto rounded-[32px] border-[6px] border-black p-10 sm:p-16 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #FBF6FF, #F2E6FF)' }}
        >
          <h2 className="relative text-black text-4xl sm:text-6xl font-black leading-none mb-4">
            Your agents.<br /><span className="text-[#9200E1]">One memory.</span>
          </h2>
          <p className="relative text-black/60 text-base sm:text-lg mb-8 max-w-lg mx-auto">
            Stop losing context every time you switch models. Store your first agent memory on 0G right now.
          </p>
          <div className="relative flex flex-wrap justify-center gap-3">
            <Link href="/store">
              <button className="bg-[#9200E1] text-white px-8 py-4 rounded-full font-black text-lg hover:opacity-90 transition-opacity">
                Store Your First Context →
              </button>
            </Link>
            <Link href="/marketplace">
              <button className="bg-white border-2 border-black text-black px-8 py-4 rounded-full font-black text-lg hover:bg-black/5 transition-colors">
                Browse Marketplace
              </button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-5xl mx-auto mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-black/45 text-sm">
          <div className="flex items-center gap-2">
            <Mark size={18} />
            <span className="font-bold text-black/70">0G Mind</span>
          </div>
          <span>Built on 0G · Galileo Testnet · Zero Cup 2026</span>
        </div>
      </section>
    </div>
  );
}
