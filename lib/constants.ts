/**
 * Smart Contract Addresses and ABIs
 * These are mock contracts for development - replace with actual addresses in production
 */

// Contract Addresses (Base L2)
export const REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_REGISTRY_ADDRESS ||
  "0x0000000000000000000000000000000000000000";

export const ANNOUNCEMENT_ADDRESS =
  process.env.NEXT_PUBLIC_ANNOUNCEMENT_ADDRESS ||
  "0x0000000000000000000000000000000000000000";

// Base L2 Chain ID (8453 for mainnet, 84532 for sepolia testnet)
export const BASE_CHAIN_ID = 84532; // Default to Sepolia testnet

// Registry Contract ABI
export const REGISTRY_ABI = [
  // Write Functions
  {
    name: "registerID",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "userAddress", type: "address" },
      { name: "username", type: "string" },
      { name: "viewingKeyPublic", type: "bytes" },
    ],
    outputs: [],
  },
  // Read Functions
  {
    name: "getViewingKey",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "username", type: "string" }],
    outputs: [{ name: "", type: "bytes" }],
  },
  {
    name: "isUsernameAvailable",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "username", type: "string" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "getUsername",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "getAddress",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "username", type: "string" }],
    outputs: [{ name: "", type: "address" }],
  },
  // Events
  {
    name: "IDRegistered",
    type: "event",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "username", type: "string", indexed: false },
      { name: "viewingKeyPublic", type: "bytes", indexed: false },
    ],
  },
] as const;

// Announcement Contract ABI
export const ANNOUNCEMENT_ABI = [
  // Write Functions
  {
    name: "announce",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "stealthAddress", type: "bytes32" },
      { name: "ephemeralPublicKey", type: "bytes" },
      { name: "metadata", type: "bytes" },
    ],
    outputs: [],
  },
  // Read Functions
  {
    name: "getAnnouncements",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "stealthAddress", type: "bytes32" },
      { name: "fromBlock", type: "uint256" },
      { name: "toBlock", type: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "sender", type: "address" },
          { name: "stealthAddress", type: "bytes32" },
          { name: "ephemeralPublicKey", type: "bytes" },
          { name: "metadata", type: "bytes" },
          { name: "blockNumber", type: "uint256" },
          { name: "timestamp", type: "uint256" },
        ],
      },
    ],
  },
  // Events
  {
    name: "Announcement",
    type: "event",
    inputs: [
      { name: "sender", type: "address", indexed: true },
      { name: "stealthAddress", type: "bytes32", indexed: true },
      { name: "ephemeralPublicKey", type: "bytes", indexed: true },
      { name: "metadata", type: "bytes", indexed: false },
      { name: "blockNumber", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;
