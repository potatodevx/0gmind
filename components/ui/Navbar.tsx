'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { IconMenu, IconClose } from '@/components/ui/icons';

const NAV_LINKS = [
  { href: '/store', label: 'Store' },
  { href: '/load', label: 'Load' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/marketplace', label: 'Marketplace' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Home page has its own dedicated header (hero)
  if (pathname === '/') return null;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(230,240,255,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(11,27,46,0.1)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
            style={{ background: 'linear-gradient(135deg, #0091ff, #8b5cf6)', color: 'white' }}
          >
            0G
          </div>
          <span className="font-black text-lg" style={{ color: '#0B1B2E' }}>
            0G<span style={{ color: '#0091ff' }}>Mind</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                color: pathname === link.href ? '#0091ff' : 'rgba(11,27,46,0.6)',
                background: pathname === link.href ? 'rgba(0,145,255,0.1)' : 'transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Network badge + CTA */}
        <div className="hidden md:flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(0,145,255,0.1)', border: '1px solid rgba(0,145,255,0.3)', color: '#0091ff' }}
          >
            <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#0091ff' }} />
            0G Galileo
          </div>
          <Link href="/store">
            <button className="btn-primary text-sm px-5 py-2">
              Store Context
            </button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          style={{ color: '#0091ff' }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <IconClose size={22} /> : <IconMenu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-6 pb-4 space-y-1"
          style={{ background: 'rgba(230,240,255,0.97)', borderTop: '1px solid rgba(11,27,46,0.1)' }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-3 rounded-lg text-sm font-semibold"
              style={{ color: pathname === link.href ? '#0091ff' : 'rgba(11,27,46,0.7)' }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
