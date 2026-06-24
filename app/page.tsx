'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';

const MemoryScene = dynamic(
  () => import('@/components/ui/MemoryScene').then((m) => ({ default: m.MemoryScene })),
  { ssr: false }
);

const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTEXT_REGISTRY_ADDRESS ||
  '0x958a498B4f1Bd1F197BC177F8398e656efD44422';
const EXPLORER = process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://chainscan-galileo.0g.ai';
const CONTRACT_URL = `${EXPLORER}/address/${CONTRACT_ADDRESS}`;

// 0G logo mark — a stylized memory node
function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="88" height="88" rx="26" fill="#0091ff" />
      <rect x="6" y="6" width="88" height="88" rx="26" fill="url(#g)" />
      <text x="50" y="66" textAnchor="middle" fontSize="44" fontWeight="900" fill="white" fontFamily="Inter, sans-serif">0G</text>
      <defs>
        <linearGradient id="g" x1="6" y1="6" x2="94" y2="94" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0091ff" />
          <stop offset="1" stopColor="#00c2ff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="bg-[#E6F0FF]">
      {/* ════════════════ HERO SCREEN (Monad-style bordered card) ════════════════ */}
      <div className="relative h-screen w-full overflow-hidden bg-[#E6F0FF]">
        {/* ── Top navbar ── */}
        <header className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-6 sm:px-10 h-[76px]">
          <Link href="/" className="flex items-center gap-2.5">
            <Mark size={28} />
            <span className="font-black tracking-widest text-[#0B1B2E] text-sm">0G MIND</span>
            <span className="text-[#0091ff] text-[11px] font-mono px-2 py-0.5 rounded-full border border-[#0B1B2E]/25 bg-white/60">
              GALILEO
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:inline-block text-[#0B1B2E] rounded-full px-4 py-2 text-xs font-black tracking-wide hover:bg-white/60 transition-colors border border-[#0B1B2E]/15 bg-white/40"
            >
              DASHBOARD
            </Link>
            <Link
              href="/store"
              className="bg-[#0B1B2E] text-[#E6F0FF] rounded-full px-5 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Store Context
            </Link>
          </div>
        </header>

        {/* ── Hero card ── */}
        <div className="absolute inset-x-4 sm:inset-x-8 top-[84px] bottom-6 rounded-[28px] border-[6px] border-[#0B1B2E] bg-[#CFE2FF] overflow-hidden shadow-2xl">
          {/* Animated memory visualization */}
          <div className="absolute inset-0 z-0 scale-[0.6] sm:scale-90 lg:scale-100 origin-center">
            <MemoryScene />
          </div>

          {/* subtle grid overlay */}
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(rgba(11,27,46,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(11,27,46,0.05) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          {/* Title — top left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute top-7 left-7 sm:top-10 sm:left-10 z-10 max-w-[70%] pointer-events-none"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="h-px w-8 bg-[#0B1B2E]" />
              <span className="text-[#0B1B2E] font-bold tracking-[0.25em] text-[10px] sm:text-[11px] opacity-70">
                0G GALILEO · PORTABLE AI MEMORY
              </span>
            </div>
            <span className="inline-block bg-[#0B1B2E] text-[#E6F0FF] px-4 sm:px-5 py-1.5 sm:py-2 rounded-2xl text-4xl sm:text-7xl font-black leading-none mb-3">
              0G MIND
            </span>
            <p className="text-[#0B1B2E] text-2xl sm:text-5xl font-black leading-[0.95] opacity-80">One Blob ID.</p>
            <p className="text-[#0B1B2E] text-2xl sm:text-5xl font-black leading-[0.95] opacity-80">Any Agent. Forever.</p>
          </motion.div>

          {/* Content / CTA card — bottom right */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="absolute bottom-7 right-4 left-4 sm:left-auto sm:bottom-10 sm:right-10 z-10 sm:w-[380px]"
          >
            <p className="inline-block text-[#0B1B2E] bg-[#0B1B2E]/5 px-4 py-1 rounded-full text-sm font-semibold mb-2">
              Memory that outlives the model
            </p>
            <p className="text-[#0B1B2E]/80 text-[13px] leading-relaxed mb-4">
              Store any AI agent&apos;s context on <span className="font-bold text-[#0B1B2E]">0G Storage</span>.
              Hand off a single <span className="font-bold text-[#0B1B2E]">blob ID</span> and any model instantly
              inherits the full memory — encrypted, owned on-chain, and portable forever.
            </p>
            <Link href="/store">
              <button className="w-full bg-[#0B1B2E] text-[#E6F0FF] py-3 rounded-full font-black text-lg tracking-wide hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h16v4H4zM4 10h16v10H4zm3 3v4h10v-4z" opacity="0.9" />
                </svg>
                STORE CONTEXT
              </button>
            </Link>
            <div className="flex gap-2 mt-2">
              <Link
                href="/load"
                className="flex-1 text-center bg-white/70 border border-[#0B1B2E]/15 text-[#0B1B2E] py-2 rounded-full text-xs font-bold hover:bg-white transition-colors"
              >
                LOAD CONTEXT
              </Link>
              <a
                href={CONTRACT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center bg-white/70 border border-[#0B1B2E]/15 text-[#0B1B2E] py-2 rounded-full text-xs font-bold hover:bg-white transition-colors"
              >
                CONTRACT ↗
              </a>
            </div>
          </motion.div>

          {/* Footer pill — bottom left */}
          <div className="hidden sm:flex absolute bottom-4 left-7 sm:left-10 z-10 items-center gap-2 text-[11px] text-[#0B1B2E]/60">
            <span>Powered by</span>
            <Mark size={14} />
            <span className="font-bold">0G</span>
            <span>· 2 GB/s storage · sub-second finality</span>
          </div>
        </div>
      </div>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section className="px-6 sm:px-10 py-20 bg-[#E6F0FF]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-8 bg-[#0B1B2E]" />
            <span className="text-[#0091ff] font-bold tracking-[0.25em] text-[11px]">THE PROTOCOL</span>
          </div>
          <h2 className="text-[#0B1B2E] text-4xl sm:text-5xl font-black mb-12">How it works</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { step: '01', title: 'Paste your context', desc: 'Drop in any AI conversation, system prompt, or agent memory.' },
              { step: '02', title: 'Store on 0G', desc: 'Encrypted and written to 0G Storage. You get a unique blob ID.' },
              { step: '03', title: 'Mint ownership', desc: 'A context NFT is minted on 0G Chain. You own the memory.' },
              { step: '04', title: 'Load anywhere', desc: 'Any agent loads the blob ID and inherits the full context instantly.' },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-3xl border-[3px] border-[#0B1B2E] bg-white/70 p-6 hover:bg-white transition-colors"
              >
                <div className="text-[#0091ff] font-black text-5xl mb-4 font-mono opacity-90">{item.step}</div>
                <h3 className="text-[#0B1B2E] font-black text-lg mb-2">{item.title}</h3>
                <p className="text-[#0B1B2E]/65 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ 0G STACK ════════════════ */}
      <section className="px-6 sm:px-10 py-20 bg-[#DCE8FF]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-8 bg-[#0B1B2E]" />
            <span className="text-[#0091ff] font-bold tracking-[0.25em] text-[11px]">THE 0G STACK</span>
          </div>
          <h2 className="text-[#0B1B2E] text-4xl sm:text-5xl font-black mb-3">Built on every layer</h2>
          <p className="text-[#0B1B2E]/60 text-base mb-12 max-w-xl">
            0G Mind is not a bolt-on. Remove any layer and the product breaks.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { layer: '0G Storage', role: 'Every context blob lives here. Encrypted, decentralized, permanent.', icon: '🗄️' },
              { layer: '0G Compute', role: 'Sealed inference inside a TEE. No one reads your data — not even node operators.', icon: '🔒' },
              { layer: '0G Chain', role: 'Context ownership as ERC-721 NFTs. Transfer, license, or revoke on-chain.', icon: '⛓️' },
              { layer: '0G DA', role: 'Every access logged permanently. Full audit trail of who used your memory.', icon: '📊' },
            ].map((item) => (
              <div
                key={item.layer}
                className="rounded-3xl border-[3px] border-[#0B1B2E] bg-white/70 p-6 flex items-start gap-4 hover:bg-white transition-colors"
              >
                <div className="text-2xl w-12 h-12 flex items-center justify-center rounded-2xl bg-[#0091ff]/10 border border-[#0091ff]/25 shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#0B1B2E] font-black">{item.layer}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0091ff]/15 text-[#0091ff] border border-[#0091ff]/30">CORE</span>
                  </div>
                  <p className="text-[#0B1B2E]/65 text-sm leading-relaxed">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ CTA ════════════════ */}
      <section className="px-6 sm:px-10 py-20 bg-[#E6F0FF]">
        <div className="max-w-5xl mx-auto rounded-[32px] border-[6px] border-[#0B1B2E] bg-[#CFE2FF] p-10 sm:p-16 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(11,27,46,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(11,27,46,0.05) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <h2 className="relative text-[#0B1B2E] text-4xl sm:text-6xl font-black leading-none mb-4">
            Your agents.<br />One memory.
          </h2>
          <p className="relative text-[#0B1B2E]/70 text-base sm:text-lg mb-8 max-w-lg mx-auto">
            Stop losing context every time you switch models. Store your first agent memory on 0G right now.
          </p>
          <div className="relative flex flex-wrap justify-center gap-3">
            <Link href="/store">
              <button className="bg-[#0B1B2E] text-[#E6F0FF] px-8 py-4 rounded-full font-black text-lg hover:opacity-90 transition-opacity">
                Store Your First Context →
              </button>
            </Link>
            <Link href="/marketplace">
              <button className="bg-white/70 border border-[#0B1B2E]/20 text-[#0B1B2E] px-8 py-4 rounded-full font-black text-lg hover:bg-white transition-colors">
                Browse Marketplace
              </button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-5xl mx-auto mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#0B1B2E]/50 text-sm">
          <div className="flex items-center gap-2">
            <Mark size={18} />
            <span className="font-bold text-[#0B1B2E]/70">0G Mind</span>
          </div>
          <span>Built on 0G · Galileo Testnet · Zero Cup 2026</span>
        </div>
      </section>
    </div>
  );
}
