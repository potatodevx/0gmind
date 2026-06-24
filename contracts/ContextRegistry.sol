// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ContextRegistry
 * @notice ERC-721 registry for portable AI agent memory on 0G Storage.
 *         Each token represents ownership of an encrypted context blob stored on 0G.
 *         Blob IDs (0G Storage root hashes) are the portable memory addresses.
 */
contract ContextRegistry {
    // ─── ERC-721 minimal implementation ───────────────────────────────────────

    string public name = "AgentPass";
    string public symbol = "AGTP";

    uint256 private _tokenIds;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    // ─── AgentPass specific ───────────────────────────────────────────────────

    struct ContextData {
        bytes32 blobId;          // 0G Storage root hash (blob ID)
        string modelName;        // AI model (e.g. "Claude Sonnet 4.5")
        string description;      // Human-readable description
        uint256 createdAt;       // Block timestamp
        bool isPublic;           // Whether anyone can load it
        uint256 sizeBytes;       // Context size in bytes
    }

    mapping(uint256 => ContextData) public contextData;
    mapping(bytes32 => uint256) public blobToToken;       // blobId → tokenId
    mapping(address => uint256[]) private _ownerTokens;
    mapping(uint256 => mapping(address => bool)) public accessGrants;  // tokenId → addr → granted

    event ContextMinted(uint256 indexed tokenId, bytes32 indexed blobId, address indexed owner, string modelName);
    event AccessGranted(uint256 indexed tokenId, address indexed grantee);
    event AccessRevoked(uint256 indexed tokenId, address indexed grantee);
    event ContextAccessed(uint256 indexed tokenId, address indexed accessor, uint256 timestamp);

    // ─── ERC-721 core ─────────────────────────────────────────────────────────

    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Token does not exist");
        return owner;
    }

    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "Zero address");
        return _balances[owner];
    }

    function approve(address to, uint256 tokenId) external {
        address owner = ownerOf(tokenId);
        require(msg.sender == owner || isApprovedForAll(owner, msg.sender), "Not authorized");
        _tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) external {
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address owner, address operator) public view returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not authorized");
        require(ownerOf(tokenId) == from, "Wrong owner");
        require(to != address(0), "Zero address");

        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        // Update owner token list
        _removeFromOwnerTokens(from, tokenId);
        _ownerTokens[to].push(tokenId);

        emit Transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) external {
        transferFrom(from, to, tokenId);
    }

    // ─── AgentPass functions ──────────────────────────────────────────────────

    /**
     * @notice Mint a new AgentPass NFT tied to a 0G Storage blob ID.
     * @param blobId The 0G Storage root hash of the stored context.
     * @param modelName The AI model name used for this context.
     * @param description Human-readable description of the context.
     * @param isPublic Whether this context can be loaded by anyone.
     * @param sizeBytes The size of the stored context in bytes.
     */
    function mintContext(
        bytes32 blobId,
        string calldata modelName,
        string calldata description,
        bool isPublic,
        uint256 sizeBytes
    ) external returns (uint256 tokenId) {
        require(blobId != bytes32(0), "Invalid blob ID");
        require(blobToToken[blobId] == 0, "Blob already registered");

        _tokenIds++;
        tokenId = _tokenIds;

        _owners[tokenId] = msg.sender;
        _balances[msg.sender] += 1;
        _ownerTokens[msg.sender].push(tokenId);

        contextData[tokenId] = ContextData({
            blobId: blobId,
            modelName: modelName,
            description: description,
            createdAt: block.timestamp,
            isPublic: isPublic,
            sizeBytes: sizeBytes
        });

        blobToToken[blobId] = tokenId;

        emit Transfer(address(0), msg.sender, tokenId);
        emit ContextMinted(tokenId, blobId, msg.sender, modelName);
    }

    /**
     * @notice Grant read access to another address for a private context.
     */
    function grantAccess(uint256 tokenId, address grantee) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(grantee != address(0), "Zero address");
        accessGrants[tokenId][grantee] = true;
        emit AccessGranted(tokenId, grantee);
    }

    /**
     * @notice Revoke previously granted access.
     */
    function revokeAccess(uint256 tokenId, address grantee) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        accessGrants[tokenId][grantee] = false;
        emit AccessRevoked(tokenId, grantee);
    }

    /**
     * @notice Log an access event on-chain (for 0G DA audit trail).
     */
    function logAccess(uint256 tokenId) external {
        require(hasAccess(tokenId, msg.sender), "No access");
        emit ContextAccessed(tokenId, msg.sender, block.timestamp);
    }

    /**
     * @notice Check whether an address can access a given context.
     */
    function hasAccess(uint256 tokenId, address user) public view returns (bool) {
        ContextData memory ctx = contextData[tokenId];
        if (ctx.blobId == bytes32(0)) return false;
        return ctx.isPublic || ownerOf(tokenId) == user || accessGrants[tokenId][user];
    }

    /**
     * @notice Get all token IDs owned by an address.
     */
    function tokensOf(address owner) external view returns (uint256[] memory) {
        return _ownerTokens[owner];
    }

    /**
     * @notice Total contexts ever minted.
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }

    /**
     * @notice Get context data by blob ID.
     */
    function getContextByBlob(bytes32 blobId) external view returns (ContextData memory, uint256 tokenId) {
        tokenId = blobToToken[blobId];
        return (contextData[tokenId], tokenId);
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (
            spender == owner ||
            _tokenApprovals[tokenId] == spender ||
            isApprovedForAll(owner, spender)
        );
    }

    function _removeFromOwnerTokens(address owner, uint256 tokenId) internal {
        uint256[] storage tokens = _ownerTokens[owner];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }
    }
}
