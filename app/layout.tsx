import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/ui/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AgentPass — Portable AI Memory on 0G',
  description:
    'Store, share, and transfer AI agent memory across any model or platform. Powered by 0G Storage, Sealed Inference, and on-chain ownership.',
  keywords: ['AI', '0G', 'blockchain', 'AI memory', 'agent', 'portable context'],
  openGraph: {
    title: 'AgentPass — Portable AI Memory on 0G',
    description: 'Portable AI memory. One blob ID. Any agent. Forever.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ background: '#050a14' }}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
