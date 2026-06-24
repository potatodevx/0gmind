// Custom, hand-built SVG icons for 0GMind. No icon libraries, no emoji.
// The four stack icons are animated with self-contained SMIL (pure SVG, no JS),
// each motion chosen to reflect what that 0G layer actually does.

type IconProps = { size?: number; className?: string };

const NAVY = '#0B1B2E';
const BLUE = '#0091ff';

/* ─────────────────────────  ANIMATED STACK ICONS  ───────────────────────── */

// 0G Storage — a database that is actively being written to: a data packet
// drops into the stack and the storage bands light up as it lands.
export function StorageIcon({ size = 26, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" r="1.7" fill={BLUE}>
        <animate attributeName="cy" values="3;7.5;7.5" keyTimes="0;0.45;1" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.15;0.4;0.5;1" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <ellipse cx="16" cy="8" rx="9" ry="3" fill="#fff" stroke={NAVY} strokeWidth="1.6" />
      <path d="M7 8 V22" stroke={NAVY} strokeWidth="1.6" />
      <path d="M25 8 V22" stroke={NAVY} strokeWidth="1.6" />
      <path d="M7 22 A9 3 0 0 0 25 22" stroke={NAVY} strokeWidth="1.6" />
      <path d="M7 13 A9 3 0 0 0 25 13" stroke={BLUE} strokeWidth="1.6" fill="none">
        <animate attributeName="opacity" values="0.2;1;0.2" dur="1.8s" begin="0.55s" repeatCount="indefinite" />
      </path>
      <path d="M7 17.5 A9 3 0 0 0 25 17.5" stroke={BLUE} strokeWidth="1.6" fill="none">
        <animate attributeName="opacity" values="0.2;1;0.2" dur="1.8s" begin="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

// 0G Compute — sealed inference inside a TEE: a locked vault with a scan line
// sweeping through it (processing) and a protective halo pulsing around it.
export function ComputeIcon({ size = 26, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="13" width="18" height="13" rx="3.5" stroke={BLUE} strokeWidth="1.3">
        <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite" />
      </rect>
      <path d="M12 14 v-2.5 a4 4 0 0 1 8 0 V14" stroke={NAVY} strokeWidth="1.6" fill="none" />
      <rect x="9" y="14" width="14" height="11.5" rx="2.2" fill="#fff" stroke={NAVY} strokeWidth="1.6" />
      <line x1="11" x2="21" stroke={BLUE} strokeWidth="1.4">
        <animate attributeName="y1" values="17.5;23;17.5" dur="2s" repeatCount="indefinite" />
        <animate attributeName="y2" values="17.5;23;17.5" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="2s" repeatCount="indefinite" />
      </line>
      <circle cx="16" cy="19.5" r="1.5" fill={NAVY} />
      <rect x="15.25" y="20" width="1.5" height="3" rx="0.7" fill={NAVY} />
    </svg>
  );
}

// 0G Chain — context ownership recorded on-chain: a token travels block to block
// and each block lights up as the transaction is finalized.
export function ChainIcon({ size = 26, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <line x1="11" y1="16" x2="13" y2="16" stroke={NAVY} strokeWidth="1.6" />
      <line x1="20" y1="16" x2="21" y2="16" stroke={NAVY} strokeWidth="1.6" />
      <rect x="3" y="12" width="8" height="8" rx="2" fill="#fff" stroke={NAVY} strokeWidth="1.6">
        <animate attributeName="stroke" values={`${NAVY};${BLUE};${NAVY}`} dur="1.8s" begin="0s" repeatCount="indefinite" />
      </rect>
      <rect x="12" y="12" width="8" height="8" rx="2" fill="#fff" stroke={NAVY} strokeWidth="1.6">
        <animate attributeName="stroke" values={`${NAVY};${BLUE};${NAVY}`} dur="1.8s" begin="0.3s" repeatCount="indefinite" />
      </rect>
      <rect x="21" y="12" width="8" height="8" rx="2" fill="#fff" stroke={NAVY} strokeWidth="1.6">
        <animate attributeName="stroke" values={`${NAVY};${BLUE};${NAVY}`} dur="1.8s" begin="0.6s" repeatCount="indefinite" />
      </rect>
      <circle cy="16" r="1.6" fill={BLUE}>
        <animate attributeName="cx" values="7;16;25;25" keyTimes="0;0.35;0.7;1" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;1;1;0" keyTimes="0;0.6;0.7;1" dur="1.8s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// 0G DA — permanent audit trail: live activity bars rise and fall as accesses
// are logged, with a cursor sweeping across the record.
export function DAIcon({ size = 26, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M5 24 H27" stroke={NAVY} strokeWidth="1.6" strokeLinecap="round" />
      <rect x="7" width="3" rx="1" fill={BLUE}>
        <animate attributeName="height" values="6;14;6" dur="1.6s" begin="0s" repeatCount="indefinite" />
        <animate attributeName="y" values="17;9;17" dur="1.6s" begin="0s" repeatCount="indefinite" />
      </rect>
      <rect x="12.5" width="3" rx="1" fill={NAVY}>
        <animate attributeName="height" values="12;5;12" dur="1.6s" begin="0.2s" repeatCount="indefinite" />
        <animate attributeName="y" values="11;18;11" dur="1.6s" begin="0.2s" repeatCount="indefinite" />
      </rect>
      <rect x="18" width="3" rx="1" fill={BLUE}>
        <animate attributeName="height" values="8;16;8" dur="1.6s" begin="0.4s" repeatCount="indefinite" />
        <animate attributeName="y" values="15;7;15" dur="1.6s" begin="0.4s" repeatCount="indefinite" />
      </rect>
      <rect x="23.5" width="3" rx="1" fill={NAVY}>
        <animate attributeName="height" values="14;7;14" dur="1.6s" begin="0.6s" repeatCount="indefinite" />
        <animate attributeName="y" values="9;16;9" dur="1.6s" begin="0.6s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}

/* ─────────────────────────  STATIC UTILITY ICONS  ───────────────────────── */
/* These inherit color via currentColor, so set the parent text color. */

export function IconLock({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M8 10 V7 a4 4 0 0 1 8 0 V10" stroke="currentColor" strokeWidth="1.8" />
      <rect x="5" y="10" width="14" height="10" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="15" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function IconGlobe({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 12 H21 M12 3 c4 4 4 14 0 18 c-4 -4 -4 -14 0 -18" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconCheck({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 12.5 l2.5 2.5 L16 9" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconHash({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M9 4 L7 20 M17 4 L15 20 M4 9 H20 M3 15 H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconLink({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M9.5 14.5 L14.5 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 12 L6 14 a3.5 3.5 0 0 0 5 5 l2 -2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 12 L18 10 a3.5 3.5 0 0 0 -5 -5 l-2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconDatabase({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="6" rx="7" ry="2.6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 6 v12 a7 2.6 0 0 0 14 0 V6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 12 a7 2.6 0 0 0 14 0" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconChat({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6 a2 2 0 0 1 2 -2 h12 a2 2 0 0 1 2 2 v8 a2 2 0 0 1 -2 2 H9 l-4 4 v-4 H6 a2 2 0 0 1 -2 -2 z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M8 9 H16 M8 12 H13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconBox({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3 L20 7 V17 L12 21 L4 17 V7 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M4 7 L12 11 L20 7 M12 11 V21" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPlug({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M9 2 V7 M15 2 V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 7 H18 V11 a6 6 0 0 1 -12 0 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 17 V22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconRefresh({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M20 11 a8 8 0 1 0 -2 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 5 V11 H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconMenu({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M4 7 H20 M4 12 H20 M4 17 H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconClose({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
