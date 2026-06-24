// 0G Network Configuration
export const ZERO_G_CHAIN = {
  id: 16602,
  name: '0G Galileo Testnet',
  nativeCurrency: { name: '0G', symbol: 'OG', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evmrpc-testnet.0g.ai'] },
    public: { http: ['https://evmrpc-testnet.0g.ai'] },
  },
  blockExplorers: {
    default: { name: '0G Explorer', url: 'https://chainscan-galileo.0g.ai' },
  },
  testnet: true,
};

// Contract Addresses — update after deployment
export const CONTEXT_REGISTRY_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTEXT_REGISTRY_ADDRESS as `0x${string}`) ||
  '0x0000000000000000000000000000000000000000';

export const CONTEXT_REGISTRY_ABI = [
  // Read
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function balanceOf(address owner) view returns (uint256)',
  'function tokensOf(address owner) view returns (uint256[])',
  'function totalSupply() view returns (uint256)',
  'function hasAccess(uint256 tokenId, address user) view returns (bool)',
  'function contextData(uint256 tokenId) view returns (bytes32 blobId, string modelName, string description, uint256 createdAt, bool isPublic, uint256 sizeBytes)',
  'function blobToToken(bytes32 blobId) view returns (uint256)',
  'function getContextByBlob(bytes32 blobId) view returns (tuple(bytes32 blobId, string modelName, string description, uint256 createdAt, bool isPublic, uint256 sizeBytes), uint256)',
  // Write
  'function mintContext(bytes32 blobId, string modelName, string description, bool isPublic, uint256 sizeBytes) returns (uint256)',
  'function grantAccess(uint256 tokenId, address grantee)',
  'function revokeAccess(uint256 tokenId, address grantee)',
  'function logAccess(uint256 tokenId)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  // Events
  'event ContextMinted(uint256 indexed tokenId, bytes32 indexed blobId, address indexed owner, string modelName)',
  'event AccessGranted(uint256 indexed tokenId, address indexed grantee)',
  'event ContextAccessed(uint256 indexed tokenId, address indexed accessor, uint256 timestamp)',
] as const;

// 0G Storage
export const ZERO_G_STORAGE_INDEXER = 'https://indexer-storage-testnet-standard.0g.ai';
export const FLOW_CONTRACT = '0x22E03a6A89B950F1c82ec5e74F8eCa321a105296';

// 0G Compute
export const ZERO_G_COMPUTE_ROUTER = 'https://api.0g.ai/v1';
