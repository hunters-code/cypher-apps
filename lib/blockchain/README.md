# Blockchain Integration

This module provides functions for interacting with the Cypher Wallet smart contracts on Base L2.

## Installation

Install required dependencies:

```bash
npm install ethers@^6.0.0
# or
yarn add ethers@^6.0.0
```

## Contracts

### Registry Contract

- **Purpose**: Username registration and lookups
- **Functions**: Register username, check availability, get viewing keys

### Announcement Contract

- **Purpose**: Announce stealth address transactions
- **Functions**: Announce transactions, scan for incoming transfers

## Usage Examples

### 1. Register a Username (Onboarding)

```typescript
import { generateStealthKeys, registerUsername } from "@/lib/blockchain";
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from "ethers";

function OnboardingComponent() {
  const { user } = usePrivy();

  const handleRegister = async () => {
    // 1. Generate stealth keys
    const keys = await generateStealthKeys();

    // 2. Get signer from Privy
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // 3. Register username
    const receipt = await registerUsername(
      signer,
      "nashirjamali", // username without @
      keys.viewingKey
    );

    console.log("Registered!", receipt);
  };
}
```

### 2. Check Username Availability

```typescript
import { checkUsernameAvailability } from "@/lib/blockchain";
import { ethers } from "ethers";

async function checkUsername(username: string) {
  const provider = new ethers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_BASE_RPC_URL
  );

  const isAvailable = await checkUsernameAvailability(provider, username);
  return isAvailable;
}
```

### 3. Send Private Transfer

```typescript
import {
  getViewingKey,
  generateStealthAddress,
  announceStealthTransaction,
} from "@/lib/blockchain";
import { ethers } from "ethers";

async function sendPrivateTransfer(recipientUsername: string, amount: string) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  // 1. Get recipient's viewing key
  const viewingKey = await getViewingKey(provider, recipientUsername);

  // 2. Generate stealth address
  const { stealthAddress, ephemeralPublicKey, ephemeralPrivateKey } =
    generateStealthAddress(viewingKey);

  // 3. Send ETH to stealth address
  const tx = await signer.sendTransaction({
    to: stealthAddress,
    value: ethers.parseEther(amount),
  });
  await tx.wait();

  // 4. Announce the transaction
  await announceStealthTransaction(signer, stealthAddress, ephemeralPublicKey, {
    amount,
    tokenSymbol: "ETH",
  });
}
```

### 4. Scan for Incoming Transfers

```typescript
import { scanForIncomingTransfers, parseMetadata } from "@/lib/blockchain";
import { ethers } from "ethers";

async function scanForTransactions(viewingKeyPrivate: string) {
  const provider = new ethers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_BASE_RPC_URL
  );

  // Get last scanned block from local storage
  const lastScannedBlock = localStorage.getItem("lastScannedBlock") || 0;
  const currentBlock = await provider.getBlockNumber();

  // Scan for incoming transfers
  const events = await scanForIncomingTransfers(
    provider,
    viewingKeyPrivate,
    Number(lastScannedBlock),
    currentBlock
  );

  // Process each event
  for (const event of events) {
    const metadata = parseMetadata(event.metadata);
    console.log("Received:", metadata.amount, metadata.tokenSymbol);
  }

  // Update last scanned block
  localStorage.setItem("lastScannedBlock", currentBlock.toString());

  return events;
}
```

### 5. Get Viewing Key for Username

```typescript
import { getViewingKey } from "@/lib/blockchain";
import { ethers } from "ethers";

async function getRecipientViewingKey(username: string) {
  const provider = new ethers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_BASE_RPC_URL
  );

  const viewingKey = await getViewingKey(provider, username);
  return viewingKey;
}
```

## Environment Variables

Add these to your `.env.local`:

```env
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_ANNOUNCEMENT_ADDRESS=0x...
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
```

## Error Handling

All functions throw errors that should be caught:

```typescript
try {
  await registerUsername(signer, username, viewingKey);
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes("user rejected")) {
      // User cancelled transaction
    } else if (error.message.includes("insufficient funds")) {
      // Not enough ETH for gas
    } else {
      // Other error
    }
  }
}
```

## Notes

- All private keys should be stored securely (encrypted in localStorage or secure storage)
- Stealth address computation happens client-side for privacy
- Event scanning can be resource-intensive - consider debouncing or using background workers
- Always validate usernames before calling contract functions
