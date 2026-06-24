'use client';

import { motion } from 'framer-motion';

// Animated "portable memory" visualization that fills the hero card.
// A central 0G memory core with model agents orbiting around it, connected by
// pulsing data lines — illustrating one blob of memory shared across any agent.

const AGENTS = [
  { label: 'GPT', angle: -50, color: '#10b981' },
  { label: 'CL', angle: 30, color: '#8b5cf6' },
  { label: 'GEM', angle: 110, color: '#0091ff' },
  { label: 'LLM', angle: 190, color: '#f59e0b' },
];

const RADIUS = 165;

export function MemoryScene() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* soft radial glow */}
      <div
        className="absolute"
        style={{
          width: 520,
          height: 520,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(0,145,255,0.22) 0%, rgba(0,194,255,0.10) 45%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />

      {/* orbit rings */}
      {[230, 330, 430].map((d, i) => (
        <motion.div
          key={d}
          className="absolute rounded-full"
          style={{
            width: d,
            height: d,
            border: '1.5px dashed rgba(11,27,46,0.18)',
          }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 40 + i * 12, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      {/* connection lines + orbiting agent nodes */}
      <div className="absolute" style={{ width: RADIUS * 2, height: RADIUS * 2 }}>
        <svg
          className="absolute inset-0"
          width={RADIUS * 2}
          height={RADIUS * 2}
          style={{ overflow: 'visible' }}
        >
          {AGENTS.map((a) => {
            const rad = (a.angle * Math.PI) / 180;
            const x = RADIUS + Math.cos(rad) * RADIUS;
            const y = RADIUS + Math.sin(rad) * RADIUS;
            return (
              <motion.line
                key={a.label}
                x1={RADIUS}
                y1={RADIUS}
                x2={x}
                y2={y}
                stroke={a.color}
                strokeWidth={2}
                strokeDasharray="5 7"
                initial={{ opacity: 0.25 }}
                animate={{ strokeDashoffset: [0, -24], opacity: [0.25, 0.7, 0.25] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
              />
            );
          })}
        </svg>

        {AGENTS.map((a, i) => {
          const rad = (a.angle * Math.PI) / 180;
          const x = RADIUS + Math.cos(rad) * RADIUS;
          const y = RADIUS + Math.sin(rad) * RADIUS;
          return (
            <motion.div
              key={a.label}
              className="absolute flex items-center justify-center rounded-2xl font-black text-xs"
              style={{
                left: x,
                top: y,
                width: 52,
                height: 52,
                marginLeft: -26,
                marginTop: -26,
                background: 'rgba(255,255,255,0.85)',
                border: `2px solid ${a.color}`,
                color: a.color,
                boxShadow: `0 8px 20px ${a.color}33`,
                backdropFilter: 'blur(4px)',
              }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {a.label}
            </motion.div>
          );
        })}
      </div>

      {/* central memory core */}
      <motion.div
        className="absolute flex flex-col items-center justify-center rounded-3xl"
        style={{
          width: 118,
          height: 118,
          background: 'linear-gradient(135deg, #0091ff 0%, #00c2ff 100%)',
          boxShadow: '0 0 60px rgba(0,145,255,0.55), inset 0 0 24px rgba(255,255,255,0.25)',
          border: '3px solid rgba(255,255,255,0.6)',
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="font-black text-white" style={{ fontSize: '2rem', lineHeight: 1 }}>
          0G
        </span>
        <span
          className="font-bold text-white"
          style={{ fontSize: '0.55rem', letterSpacing: '0.15em', opacity: 0.85 }}
        >
          MEMORY
        </span>
      </motion.div>

      {/* floating data particles */}
      {Array.from({ length: 14 }).map((_, i) => {
        const left = (i * 67) % 100;
        const top = (i * 41) % 100;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: 4,
              height: 4,
              background: i % 2 === 0 ? '#0091ff' : '#00c2ff',
            }}
            animate={{ opacity: [0.1, 0.6, 0.1], scale: [1, 1.6, 1] }}
            transition={{ duration: 2 + (i % 5), repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
          />
        );
      })}
    </div>
  );
}
