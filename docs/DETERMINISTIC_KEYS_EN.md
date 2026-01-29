# Cypher Wallet - Deterministic Key Generation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Key Generation](#key-generation)
4. [Username Registration](#username-registration)
5. [Gasless Registration via Backend API](#gasless-registration-via-backend-api)
6. [Recovery Flow](#recovery-flow)
7. [Security Model](#security-model)
8. [Implementation Details](#implementation-details)
9. [API Reference](#api-reference)
10. [Migration Guide](#migration-guide)
11. [Best Practices](#best-practices)

---

## Overview

Cypher Wallet implements a **deterministic key generation system** where privacy keys are derived from the user's wallet signature and PIN. This eliminates the need for key backup and storage while maintaining strong security through two-factor authentication.

### Key Features

- ✅ **Deterministic Keys**: Keys are always the same (derived from wallet + PIN)
- ✅ **No Key Storage**: Keys can be recovered on-demand
- ✅ **Two-Factor Security**: Requires both wallet and PIN
- ✅ **Blockchain-Only**: No database needed for key storage
- ✅ **Recovery**: Keys can be recovered with wallet + PIN

### Benefits

1. **Simplified Architecture**: No need for encrypted key storage
2. **Better UX**: Users don't need to backup keys
3. **Strong Security**: Two-factor authentication (wallet + PIN)
4. **Portability**: Works across devices with wallet + PIN
5. **Decentralized**: No reliance on database for critical data

---

## Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Onboarding                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  1. User connects wallet (Privy)  │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  2. User signs message (one-time)  │
        │     → Wallet Signature             │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  3. User sets 6-digit PIN          │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  4. Derive Meta Keys               │
        │     SHA-512(wallet + PIN + domain) │
        │     → metaViewPub/Priv             │
        │     → metaSpendPub/Priv            │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  5. Register Username on-chain    │
        │     username → metaViewPub        │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  6. Store PIN hash (localStorage) │
        │     Cache wallet signature        │
        └───────────────────────────────────┘
```

### Component Diagram

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Privy      │─────▶│   Wallet     │─────▶│  Signature   │
│  Auth        │      │   Address    │      │   (Cached)   │
└──────────────┘      └──────────────┘      └──────────────┘
                                                    │
                                                    ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│     PIN      │─────▶│   Meta Key   │─────▶│  Blockchain   │
│  (6 digits)  │      │  Derivation  │      │  Registry    │
└──────────────┘      └──────────────┘      └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │  Stealth     │
                    │  Addresses   │
                    └──────────────┘
```

---

## Key Generation

### Deterministic Derivation

Meta keys are deterministically derived from:

- **Wallet Signature**: One-time signature from user's wallet
- **PIN**: 6-digit user-selected PIN
- **Domain Separation**: Different domains for viewing and spending keys

### Algorithm

```typescript
// Viewing Key Derivation
const viewSeed =
  SHA -
  512([
    walletSignature,
    PIN,
    "Cypher View Authority | Deterministic Derivation",
  ]).slice(0, 32);

const metaViewPriv = derivePrivateKey(viewSeed);
const metaViewPub = derivePublicKey(metaViewPriv);

// Spending Key Derivation
const spendSeed =
  SHA -
  512([
    walletSignature,
    PIN,
    "Cypher Spend Authority | Deterministic Derivation",
  ]).slice(0, 32);

const metaSpendPriv = derivePrivateKey(spendSeed);
const metaSpendPub = derivePublicKey(metaSpendPriv);
```

### Key Properties

| Property             | Description                                     |
| -------------------- | ----------------------------------------------- |
| **Deterministic**    | Same inputs always produce same keys            |
| **Domain Separated** | Viewing and spending keys use different domains |
| **Two-Factor**       | Requires both wallet signature and PIN          |
| **Recoverable**      | Can be regenerated from wallet + PIN            |

---

## Username Registration

### Blockchain Registration

Username registration is stored **only on blockchain** (no database needed):

```solidity
// Smart Contract Registry
mapping(string => bytes) public viewingKeys;  // username → metaViewPub
mapping(address => string) public usernames;  // wallet → username
mapping(string => address) public addresses;   // username → wallet
```

### Registration Flow

1. **Generate Meta Keys**: Derive from wallet + PIN
2. **Check Availability**: Query blockchain for username availability
3. **Register On-Chain**: Store `username → metaViewPub` mapping
4. **Store Locally**: Cache PIN hash and wallet signature

### Why Blockchain-Only?

- ✅ **Interoperability**: Other apps can resolve usernames
- ✅ **Decentralization**: No single point of failure
- ✅ **Verifiability**: Anyone can verify username ownership
- ✅ **Global Namespace**: Unique usernames across all apps

---

## Gasless Registration via Backend API

### Overview

Since username registration to smart contract requires gas fees, and new users often don't have ETH in their wallets, Cypher Wallet implements a **gasless registration system** where the platform sponsors the gas fee via a backend API.

### How It Works

```
User Flow:
1. User input username + PIN
2. Derive meta keys (wallet + PIN)
3. User signs authorization message
4. Frontend calls backend API with signature
5. Backend verifies signature
6. Backend executes transaction with platform wallet
7. User gets seamless registration (no gas needed)
```

### Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │─────▶│  Backend API │─────▶│  Smart       │
│              │      │              │      │  Contract    │
│  User signs  │      │  Verifies    │      │              │
│  message     │      │  signature   │      │  Platform    │
│              │      │  Pays gas    │      │  wallet pays │
└──────────────┘      └──────────────┘      └──────────────┘
```

### Benefits

- ✅ **Seamless UX**: User doesn't need gas fee
- ✅ **User Ownership**: Signature verification ensures user authorization
- ✅ **Budget Control**: Platform can manage registration costs
- ✅ **Rate Limiting**: Prevent abuse with per-wallet limits
- ✅ **Security**: Cryptographic proof of user intent

### Cost Estimation

**Base L2 Gas Fee per Registration:**

- Estimated: ~50,000 - 100,000 gas
- At 0.1 gwei: ~0.000005 - 0.00001 ETH
- At $2000/ETH: ~$0.01 - $0.02 per registration

**Monthly Cost (1000 users):**

- 1000 registrations × $0.02 = **$20/month**
- Very manageable for platform

### Backend API Implementation

#### API Endpoint

```typescript
// app/api/register-username/route.ts
import { ethers } from "ethers";
import { REGISTRY_ADDRESS, REGISTRY_ABI } from "@/lib/constants";

interface RegisterRequest {
  username: string;
  viewingKey: string;
  walletAddress: string;
  signature: string;
}

export async function POST(request: Request) {
  try {
    const { username, viewingKey, walletAddress, signature }: RegisterRequest =
      await request.json();

    // 1. Verify user signature
    const message = `Register @${username} for ${walletAddress}`;
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 2. Check rate limit (1 registration per wallet per day)
    const rateLimitKey = `register_${walletAddress.toLowerCase()}`;
    const rateLimit = await checkRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      return Response.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    // 3. Check username availability on blockchain
    const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
    const registry = new ethers.Contract(
      REGISTRY_ADDRESS,
      REGISTRY_ABI,
      provider
    );

    const isAvailable = await registry.isUsernameAvailable(username);
    if (!isAvailable) {
      return Response.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    // 4. Execute transaction with platform wallet
    const relayerWallet = new ethers.Wallet(
      process.env.RELAYER_PRIVATE_KEY!,
      provider
    );

    const registryWithSigner = new ethers.Contract(
      REGISTRY_ADDRESS,
      REGISTRY_ABI,
      relayerWallet
    );

    const viewingKeyBytes = ethers.getBytes(viewingKey);
    const tx = await registryWithSigner.registerID(username, viewingKeyBytes);
    const receipt = await tx.wait();

    // 5. Record rate limit
    await recordRateLimit(rateLimitKey);

    return Response.json({
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
```

#### Rate Limiting

```typescript
// lib/api/rate-limit.ts
const rateLimits = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(key: string): Promise<{
  allowed: boolean;
  remaining?: number;
}> {
  const limit = rateLimits.get(key);
  const now = Date.now();

  if (!limit || now > limit.resetAt) {
    return { allowed: true };
  }

  if (limit.count >= 1) {
    const remaining = Math.ceil((limit.resetAt - now) / 1000);
    return { allowed: false, remaining };
  }

  return { allowed: true };
}

export async function recordRateLimit(key: string): Promise<void> {
  const now = Date.now();
  rateLimits.set(key, {
    count: 1,
    resetAt: now + 86400000, // 24 hours
  });
}
```

### Frontend Implementation

```typescript
// app/onboarding/page.tsx - Updated registration flow
const handleSubmit = async () => {
  // ... validation ...

  try {
    const walletAddr = address || walletAddress;

    // 1. Get wallet signature
    const walletSignature = await getOrCreateWalletSignature(
      signer,
      walletAddr
    );

    // 2. Get PIN
    const pin = await promptForPIN();

    // 3. Derive meta keys
    const metaKeys = await deriveMetaKeys(walletAddr, walletSignature, pin);

    // 4. Sign registration authorization
    const authMessage = `Register @${cleanUsername} for ${walletAddr}`;
    const authSignature = await signer.signMessage(authMessage);

    // 5. Call backend API (gasless)
    const response = await fetch("/api/register-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: cleanUsername,
        viewingKey: metaKeys.metaViewPub,
        walletAddress: walletAddr,
        signature: authSignature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    const { txHash } = await response.json();

    // 6. Store PIN hash
    storePINHash(hashPIN(pin), walletAddr);

    // 7. Success - go to dashboard
    router.push("/dashboard");
  } catch (err) {
    // error handling
  }
};
```

### Security Considerations

#### 1. Signature Verification

```typescript
function verifyRegistrationRequest(
  username: string,
  walletAddress: string,
  signature: string
): boolean {
  const message = `Register @${username} for ${walletAddress}`;
  const recovered = ethers.verifyMessage(message, signature);
  return recovered.toLowerCase() === walletAddress.toLowerCase();
}
```

#### 2. Rate Limiting

- **1 registration per wallet per day**
- Prevents abuse and spam
- IP-based rate limiting (optional)
- Wallet address-based tracking

#### 3. Relayer Wallet Security

- Use hardware wallet or secure key management
- Separate wallet for registrations (not main wallet)
- Monitor balance and set alerts
- Regular security audits

#### 4. Error Handling

```typescript
// Handle different error scenarios
if (error.message.includes("Invalid signature")) {
  setError("Authorization failed. Please try again.");
} else if (error.message.includes("Rate limit")) {
  setError("Too many requests. Please try again later.");
} else if (error.message.includes("already taken")) {
  setError("Username is already taken.");
} else {
  setError("Registration failed. Please try again.");
}
```

### Environment Variables

```env
# .env.local (Backend)

# Relayer wallet for gasless transactions
RELAYER_PRIVATE_KEY=0x...

# Base L2 RPC
BASE_RPC_URL=https://mainnet.base.org

# Rate limiting (optional)
REDIS_URL=redis://... # For distributed rate limiting
```

### Monitoring & Analytics

```typescript
// Track registration metrics
interface RegistrationMetrics {
  totalRegistrations: number;
  dailyRegistrations: number;
  gasCostPerRegistration: number;
  failedRegistrations: number;
  rateLimitHits: number;
}

// Log events
logger.info("Registration successful", {
  username,
  walletAddress,
  txHash,
  gasUsed: receipt.gasUsed.toString(),
});
```

### Alternative: Hybrid Approach

For cost optimization, you can implement a hybrid approach:

```typescript
// Sponsor only for first-time users
async function registerUsernameAPI(request: RegisterRequest) {
  const isFirstTime = await checkFirstTimeUser(request.walletAddress);

  if (isFirstTime) {
    // Sponsor gas fee
    return await sponsorRegistration(request);
  } else {
    // User pays (lazy registration)
    return {
      requiresUserApproval: true,
      message: "Please approve registration transaction",
    };
  }
}
```

### Cost Management

**Budget Planning:**

- Set monthly budget limit
- Monitor cost per user
- Alert when approaching limit
- Consider sponsor only for first-time users

**Optimization:**

- Batch transactions (if multiple registrations)
- Use gas-efficient contract design
- Monitor gas prices and optimize timing

---

## Recovery Flow

### Key Recovery Process

```typescript
async function recoverKeys(walletAddress: string, pin: string) {
  // 1. Get cached wallet signature (or request new one)
  let signature = getCachedWalletSignature(walletAddress);
  if (!signature) {
    signature = await requestWalletSignature(walletAddress);
    cacheWalletSignature(walletAddress, signature);
  }

  // 2. Verify PIN
  if (!verifyPIN(pin, walletAddress)) {
    throw new Error("Invalid PIN");
  }

  // 3. Derive keys (deterministic - always same)
  const keys = await deriveMetaKeys(walletAddress, signature, pin);

  return keys;
}
```

### Recovery Scenarios

| Scenario        | Solution                                     |
| --------------- | -------------------------------------------- |
| **Lost Device** | Recover with wallet + PIN on new device      |
| **Forgot PIN**  | Cannot recover keys (but wallet still works) |
| **Lost Wallet** | Cannot recover (need wallet signature)       |
| **New Device**  | Just need wallet + PIN                       |

---

## Security Model

### Two-Factor Authentication

Keys require **both**:

1. **Wallet Signature**: Proves wallet ownership
2. **PIN**: User-selected secret

### Security Properties

| Attack Vector               | Protection                                |
| --------------------------- | ----------------------------------------- |
| **PIN Brute Force**         | Rate limiting (5 attempts, 15min lockout) |
| **Wallet Compromise**       | PIN still required for keys               |
| **Storage Theft**           | PIN hash stored (not plain PIN)           |
| **Network Analysis**        | Unlinkable stealth addresses              |
| **Transaction Correlation** | Ephemeral keys prevent linking            |

### PIN Security

- **Length**: 6 digits (10^6 = 1,000,000 combinations)
- **Rate Limiting**: 5 failed attempts → 15min lockout
- **Storage**: Only hash stored (not plain PIN)
- **Verification**: Hash comparison (not decryption)

---

## Implementation Details

### File Structure

```
lib/
├── blockchain/
│   ├── meta-keys.ts          # Deterministic key derivation
│   ├── recovery.ts           # Key recovery logic
│   ├── registry.ts           # Blockchain registry interactions
│   └── stealth.ts            # Stealth address generation
├── utils/
│   ├── wallet-signature.ts   # Wallet signature management
│   └── pin.ts                # PIN validation and storage
components/
└── auth/
    └── PINInput.tsx          # PIN input component
```

### Key Functions

#### 1. Meta Key Derivation

```typescript
deriveMetaKeys(
  walletAddress: string,
  walletSignature: string,
  pin: string
): Promise<MetaKeys>
```

#### 2. Wallet Signature

```typescript
getOrCreateWalletSignature(
  signer: ethers.Signer,
  walletAddress: string
): Promise<string>
```

#### 3. PIN Management

```typescript
validatePIN(pin: string): { valid: boolean; error?: string }
storePINHash(pinHash: string, walletAddress: string): void
verifyPIN(pin: string, walletAddress: string): boolean
checkPINLockout(walletAddress: string): { locked: boolean }
```

#### 4. Key Recovery

```typescript
recoverMetaKeys(
  walletAddress: string,
  pin: string,
  signer: ethers.Signer
): Promise<MetaKeys>
```

---

## API Reference

### Meta Keys Module

#### `deriveMetaKeys()`

Derives deterministic meta keys from wallet signature and PIN.

**Parameters:**

- `walletAddress: string` - User's wallet address
- `walletSignature: string` - Wallet signature (from signMessage)
- `pin: string` - 6-digit PIN

**Returns:**

```typescript
{
  metaViewPriv: string;
  metaViewPub: string;
  metaSpendPriv: string;
  metaSpendPub: string;
}
```

**Example:**

```typescript
const keys = await deriveMetaKeys("0x1234...", "0xabcd...", "123456");
```

### Wallet Signature Module

#### `getOrCreateWalletSignature()`

Gets cached wallet signature or requests new one.

**Parameters:**

- `signer: ethers.Signer` - Privy signer
- `walletAddress: string` - Wallet address

**Returns:** `Promise<string>` - Wallet signature

**Example:**

```typescript
const signature = await getOrCreateWalletSignature(signer, walletAddress);
```

### PIN Module

#### `validatePIN()`

Validates PIN format (6 digits).

**Parameters:**

- `pin: string` - PIN to validate

**Returns:**

```typescript
{ valid: boolean; error?: string }
```

#### `verifyPIN()`

Verifies PIN against stored hash.

**Parameters:**

- `pin: string` - PIN to verify
- `walletAddress: string` - Wallet address

**Returns:** `boolean`

#### `checkPINLockout()`

Checks if wallet is locked due to failed attempts.

**Parameters:**

- `walletAddress: string` - Wallet address

**Returns:**

```typescript
{ locked: boolean; remainingTime?: number }
```

### Recovery Module

#### `recoverMetaKeys()`

Recovers meta keys from wallet + PIN.

**Parameters:**

- `walletAddress: string` - Wallet address
- `pin: string` - 6-digit PIN
- `signer: ethers.Signer` - Privy signer

**Returns:** `Promise<MetaKeys>`

**Throws:**

- `Error` if PIN is invalid
- `Error` if wallet is locked

---

## Migration Guide

### From Random Keys to Deterministic Keys

#### Step 1: Update Key Generation

Replace:

```typescript
const keys = await generateStealthKeys(); // Random
```

With:

```typescript
const signature = await getOrCreateWalletSignature(signer, walletAddress);
const keys = await deriveMetaKeys(walletAddress, signature, pin); // Deterministic
```

#### Step 2: Add PIN Input

Add PIN input component to onboarding:

```typescript
<PINInput
  onComplete={(pin) => {
    // Continue with registration
  }}
  onError={(error) => {
    setError(error);
  }}
/>
```

#### Step 3: Update Storage

Remove:

- Key storage in database
- Key backup mechanisms

Add:

- PIN hash storage (localStorage)
- Wallet signature caching (localStorage)

#### Step 4: Update Recovery

Replace key restore with PIN-based recovery:

```typescript
// Old: Restore from backup
const keys = await restoreKeysFromBackup(backupData);

// New: Recover from wallet + PIN
const keys = await recoverMetaKeys(walletAddress, pin, signer);
```

### Migration for Existing Users

1. **Prompt for PIN**: Ask existing users to set PIN
2. **Derive New Keys**: Generate deterministic keys
3. **Update Registration**: Re-register with new metaViewPub (if needed)
4. **Remove Old Keys**: Clean up old random keys

---

## Best Practices

### 1. PIN Management

- ✅ Always validate PIN format (6 digits)
- ✅ Implement rate limiting (5 attempts, 15min lockout)
- ✅ Store only PIN hash (never plain PIN)
- ✅ Clear PIN from memory after use

### 2. Wallet Signature

- ✅ Cache signature in localStorage (one-time operation)
- ✅ Use consistent message format
- ✅ Never share signature with third parties

### 3. Key Derivation

- ✅ Always use domain separation
- ✅ Use secure random for ephemeral keys
- ✅ Never log or expose private keys

### 4. Security

- ✅ Implement PIN lockout after failed attempts
- ✅ Clear sensitive data from memory
- ✅ Use secure storage for PIN hash
- ✅ Validate all inputs before processing

### 5. Error Handling

- ✅ Provide clear error messages
- ✅ Don't reveal if PIN is correct (rate limiting)
- ✅ Log security events (not sensitive data)
- ✅ Handle network failures gracefully

---

## FAQ

### Q: What happens if I forget my PIN?

**A:** You cannot recover your privacy keys without the PIN. However, your wallet still works for regular transactions. You would need to re-register your username with a new PIN.

### Q: Can I change my PIN?

**A:** Changing PIN requires re-deriving keys and re-registering username on blockchain. This is a security feature to prevent key compromise.

### Q: Is my PIN stored securely?

**A:** Only the hash of your PIN is stored (SHA-256). The plain PIN is never stored or transmitted.

### Q: What if someone steals my wallet?

**A:** They still need your PIN to derive privacy keys. Your wallet alone is not enough.

### Q: Can I use the same PIN on multiple devices?

**A:** Yes! Since keys are deterministic, same wallet + PIN = same keys on any device.

### Q: Do I need to backup my keys?

**A:** No! Keys are deterministic and can be recovered with wallet + PIN. Just remember your PIN.

---

## References

- [EIP-712: Typed Structured Data Hashing](https://eips.ethereum.org/EIPS/eip-712)
- [Stealth Addresses](https://vitalik.ca/general/2023/01/20/stealth.html)
- [Deterministic Key Derivation](https://en.wikipedia.org/wiki/Key_derivation_function)

---

## Support

For questions or issues, please contact the Cypher Wallet team or open an issue on GitHub.
