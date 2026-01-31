export const REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_REGISTRY_ADDRESS ||
  "0x0000000000000000000000000000000000000000";

export const ANNOUNCEMENT_ADDRESS =
  process.env.NEXT_PUBLIC_ANNOUNCEMENT_ADDRESS ||
  "0x0000000000000000000000000000000000000000";

export const BASE_CHAIN_ID = 84532;

export const REGISTRY_ABI = [
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

export const ANNOUNCEMENT_ABI = [
  {
    name: "announce",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "stealthAddress", type: "address" },
      { name: "ephemeralPublicKey", type: "bytes" },
      { name: "metadata", type: "bytes" },
    ],
    outputs: [],
  },
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
