# Cypher Wallet - Generasi Kunci Deterministik

## Daftar Isi

1. [Gambaran Umum](#gambaran-umum)
2. [Arsitektur](#arsitektur)
3. [Generasi Kunci](#generasi-kunci)
4. [Registrasi Username](#registrasi-username)
5. [Registrasi Gasless via Backend API](#registrasi-gasless-via-backend-api)
6. [Alur Recovery](#alur-recovery)
7. [Model Keamanan](#model-keamanan)
8. [Detail Implementasi](#detail-implementasi)
9. [Referensi API](#referensi-api)
10. [Panduan Migrasi](#panduan-migrasi)
11. [Best Practices](#best-practices)

---

## Gambaran Umum

Cypher Wallet mengimplementasikan sistem generasi kunci deterministik di mana kunci privasi diturunkan dari tanda tangan wallet pengguna dan PIN. Ini menghilangkan kebutuhan untuk backup dan penyimpanan kunci sambil mempertahankan keamanan yang kuat melalui autentikasi dua faktor.

### Fitur Utama

- ✅ **Kunci Deterministik**: Kunci selalu sama (diturunkan dari wallet + PIN)
- ✅ **Tanpa Penyimpanan Kunci**: Kunci dapat di-recover on-demand
- ✅ **Keamanan Dua Faktor**: Membutuhkan wallet dan PIN
- ✅ **Hanya Blockchain**: Tidak perlu database untuk penyimpanan kunci
- ✅ **Recovery**: Kunci dapat di-recover dengan wallet + PIN

### Keuntungan

1. **Arsitektur Sederhana**: Tidak perlu penyimpanan kunci terenkripsi
2. **UX Lebih Baik**: User tidak perlu backup kunci
3. **Keamanan Kuat**: Autentikasi dua faktor (wallet + PIN)
4. **Portabilitas**: Bekerja di berbagai perangkat dengan wallet + PIN
5. **Terdesentralisasi**: Tidak bergantung pada database untuk data kritis

---

## Arsitektur

### Alur Tingkat Tinggi

```
┌─────────────────────────────────────────────────────────────┐
│                 Onboarding Pengguna                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  1. User connect wallet (Privy)   │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  2. User tanda tangan pesan       │
        │     (sekali) → Wallet Signature    │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  3. User set PIN 6 digit          │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  4. Turunkan Meta Keys            │
        │     SHA-512(wallet + PIN + domain)│
        │     → metaViewPub/Priv             │
        │     → metaSpendPub/Priv            │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  5. Daftarkan Username on-chain   │
        │     username → metaViewPub        │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  6. Simpan PIN hash (localStorage)│
        │     Cache wallet signature        │
        └───────────────────────────────────┘
```

### Diagram Komponen

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Privy      │─────▶│   Wallet     │─────▶│  Signature   │
│  Auth        │      │   Address    │      │   (Cached)   │
└──────────────┘      └──────────────┘      └──────────────┘
                                                    │
                                                    ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│     PIN      │─────▶│   Meta Key   │─────▶│  Blockchain  │
│  (6 digit)   │      │  Derivation  │      │  Registry    │
└──────────────┘      └──────────────┘      └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │  Stealth     │
                    │  Addresses   │
                    └──────────────┘
```

---

## Generasi Kunci

### Penurunan Deterministik

Meta keys diturunkan secara deterministik dari:

- **Wallet Signature**: Tanda tangan sekali pakai dari wallet pengguna
- **PIN**: PIN 6 digit yang dipilih pengguna
- **Domain Separation**: Domain berbeda untuk viewing dan spending keys

### Algoritma

```typescript
// Penurunan Viewing Key
const viewSeed =
  SHA -
  512([
    walletSignature,
    PIN,
    "Cypher View Authority | Deterministic Derivation",
  ]).slice(0, 32);

const metaViewPriv = derivePrivateKey(viewSeed);
const metaViewPub = derivePublicKey(metaViewPriv);

// Penurunan Spending Key
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

### Sifat Kunci

| Sifat                | Deskripsi                                            |
| -------------------- | ---------------------------------------------------- |
| **Deterministik**    | Input yang sama selalu menghasilkan kunci yang sama  |
| **Domain Terpisah**  | Viewing dan spending keys menggunakan domain berbeda |
| **Dua Faktor**       | Membutuhkan wallet signature dan PIN                 |
| **Dapat Di-recover** | Dapat dibuat ulang dari wallet + PIN                 |

---

## Registrasi Username

### Registrasi Blockchain

Registrasi username disimpan hanya di blockchain (tidak perlu database):

```solidity
// Smart Contract Registry
mapping(string => bytes) public viewingKeys;  // username → metaViewPub
mapping(address => string) public usernames;  // wallet → username
mapping(string => address) public addresses;  // username → wallet
```

### Alur Registrasi

1. **Generate Meta Keys**: Turunkan dari wallet + PIN
2. **Cek Ketersediaan**: Query blockchain untuk ketersediaan username
3. **Daftar On-Chain**: Simpan mapping `username → metaViewPub`
4. **Simpan Lokal**: Cache PIN hash dan wallet signature

### Mengapa Hanya Blockchain?

- ✅ **Interoperabilitas**: Aplikasi lain dapat resolve username
- ✅ **Desentralisasi**: Tidak ada single point of failure
- ✅ **Dapat Diverifikasi**: Siapa pun dapat memverifikasi kepemilikan username
- ✅ **Namespace Global**: Username unik di semua aplikasi

---

## Registrasi Gasless via Backend API

### Gambaran Umum

Karena registrasi username ke smart contract memerlukan gas fee, dan user baru sering belum memiliki ETH di wallet mereka, Cypher Wallet mengimplementasikan sistem registrasi gasless di mana platform mensponsori gas fee melalui backend API.

### Cara Kerja

```
Alur User:
1. User input username + PIN
2. Turunkan meta keys (wallet + PIN)
3. User tanda tangan pesan otorisasi
4. Frontend call backend API dengan signature
5. Backend verifikasi signature
6. Backend eksekusi transaksi dengan platform wallet
7. User mendapat registrasi seamless (tidak perlu gas)
```

### Arsitektur

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │─────▶│  Backend API │─────▶│  Smart       │
│              │      │              │      │  Contract    │
│  User signs  │      │  Verifies    │      │              │
│  message     │      │  signature   │      │  Platform    │
│              │      │  Pays gas    │      │  wallet pays │
└──────────────┘      └──────────────┘      └──────────────┘
```

### Keuntungan

- ✅ **UX Seamless**: User tidak perlu gas fee
- ✅ **Kepemilikan User**: Verifikasi signature memastikan otorisasi user
- ✅ **Kontrol Budget**: Platform dapat mengelola biaya registrasi
- ✅ **Rate Limiting**: Mencegah abuse dengan limit per wallet
- ✅ **Keamanan**: Bukti kriptografis dari intent user

### Estimasi Biaya

**Gas Fee Base L2 per Registrasi:**

- Estimasi: ~50,000 - 100,000 gas
- Pada 0.1 gwei: ~0.000005 - 0.00001 ETH
- Pada $2000/ETH: ~$0.01 - $0.02 per registrasi

**Biaya Bulanan (1000 user):**

- 1000 registrasi × $0.02 = **$20/bulan**
- Sangat terjangkau untuk platform

### Implementasi Backend API

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

    // 1. Verifikasi signature user
    const message = `Register @${username} for ${walletAddress}`;
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return Response.json({ error: "Signature tidak valid" }, { status: 401 });
    }

    // 2. Cek rate limit (1 registrasi per wallet per hari)
    const rateLimitKey = `register_${walletAddress.toLowerCase()}`;
    const rateLimit = await checkRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      return Response.json(
        { error: "Rate limit terlampaui. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }

    // 3. Cek ketersediaan username di blockchain
    const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
    const registry = new ethers.Contract(
      REGISTRY_ADDRESS,
      REGISTRY_ABI,
      provider
    );

    const isAvailable = await registry.isUsernameAvailable(username);
    if (!isAvailable) {
      return Response.json(
        { error: "Username sudah digunakan" },
        { status: 400 }
      );
    }

    // 4. Eksekusi transaksi dengan platform wallet
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
      { error: "Registrasi gagal. Silakan coba lagi." },
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
    resetAt: now + 86400000, // 24 jam
  });
}
```

### Implementasi Frontend

```typescript
// app/onboarding/page.tsx - Updated registration flow
const handleSubmit = async () => {
  // ... validation ...

  try {
    const walletAddr = address || walletAddress;

    // 1. Ambil wallet signature
    const walletSignature = await getOrCreateWalletSignature(
      signer,
      walletAddr
    );

    // 2. Ambil PIN
    const pin = await promptForPIN();

    // 3. Turunkan meta keys
    const metaKeys = await deriveMetaKeys(walletAddr, walletSignature, pin);

    // 4. Tanda tangan otorisasi registrasi
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
      throw new Error(error.error || "Registrasi gagal");
    }

    const { txHash } = await response.json();

    // 6. Simpan PIN hash
    storePINHash(hashPIN(pin), walletAddr);

    // 7. Success - masuk dashboard
    router.push("/dashboard");
  } catch (err) {
    // error handling
  }
};
```

### Pertimbangan Keamanan

#### 1. Verifikasi Signature

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

- **1 registrasi per wallet per hari**
- Mencegah abuse dan spam
- Rate limiting berbasis IP (opsional)
- Tracking berbasis wallet address

#### 3. Keamanan Relayer Wallet

- Gunakan hardware wallet atau key management yang aman
- Wallet terpisah untuk registrasi (bukan wallet utama)
- Monitor balance dan set alert
- Audit keamanan berkala

#### 4. Error Handling

```typescript
// Handle berbagai skenario error
if (error.message.includes("Invalid signature")) {
  setError("Otorisasi gagal. Silakan coba lagi.");
} else if (error.message.includes("Rate limit")) {
  setError("Terlalu banyak request. Silakan coba lagi nanti.");
} else if (error.message.includes("already taken")) {
  setError("Username sudah digunakan.");
} else {
  setError("Registrasi gagal. Silakan coba lagi.");
}
```

### Environment Variables

```env
# .env.local (Backend)

# Relayer wallet untuk gasless transactions
RELAYER_PRIVATE_KEY=0x...

# Base L2 RPC
BASE_RPC_URL=https://mainnet.base.org

# Rate limiting (opsional)
REDIS_URL=redis://... # Untuk distributed rate limiting
```

### Monitoring & Analytics

```typescript
// Track metrik registrasi
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

### Alternatif: Pendekatan Hybrid

Untuk optimasi biaya, Anda dapat mengimplementasikan pendekatan hybrid:

```typescript
// Sponsor hanya untuk first-time users
async function registerUsernameAPI(request: RegisterRequest) {
  const isFirstTime = await checkFirstTimeUser(request.walletAddress);

  if (isFirstTime) {
    // Sponsor gas fee
    return await sponsorRegistration(request);
  } else {
    // User bayar (lazy registration)
    return {
      requiresUserApproval: true,
      message: "Silakan approve transaksi registrasi",
    };
  }
}
```

### Manajemen Biaya

**Perencanaan Budget:**

- Set limit budget bulanan
- Monitor biaya per user
- Alert saat mendekati limit
- Pertimbangkan sponsor hanya untuk first-time users

**Optimasi:**

- Batch transactions (jika multiple registrations)
- Gunakan desain contract yang efisien gas
- Monitor gas prices dan optimasi timing

---

## Alur Recovery

### Proses Recovery Kunci

```typescript
async function recoverKeys(walletAddress: string, pin: string) {
  // 1. Ambil wallet signature yang di-cache (atau minta yang baru)
  let signature = getCachedWalletSignature(walletAddress);
  if (!signature) {
    signature = await requestWalletSignature(walletAddress);
    cacheWalletSignature(walletAddress, signature);
  }

  // 2. Verifikasi PIN
  if (!verifyPIN(pin, walletAddress)) {
    throw new Error("PIN tidak valid");
  }

  // 3. Turunkan kunci (deterministik - selalu sama)
  const keys = await deriveMetaKeys(walletAddress, signature, pin);

  return keys;
}
```

### Skenario Recovery

| Skenario                 | Solusi                                                  |
| ------------------------ | ------------------------------------------------------- |
| **Kehilangan Perangkat** | Recover dengan wallet + PIN di perangkat baru           |
| **Lupa PIN**             | Tidak dapat recover kunci (tapi wallet masih berfungsi) |
| **Kehilangan Wallet**    | Tidak dapat recover (perlu wallet signature)            |
| **Perangkat Baru**       | Hanya perlu wallet + PIN                                |

---

## Model Keamanan

### Autentikasi Dua Faktor

Kunci membutuhkan keduanya:

1. **Wallet Signature**: Membuktikan kepemilikan wallet
2. **PIN**: Rahasia yang dipilih pengguna

### Sifat Keamanan

| Vektor Serangan        | Perlindungan                                  |
| ---------------------- | --------------------------------------------- |
| **Brute Force PIN**    | Rate limiting (5 percobaan, lockout 15 menit) |
| **Kompromi Wallet**    | PIN masih diperlukan untuk kunci              |
| **Pencurian Storage**  | PIN hash disimpan (bukan PIN plain)           |
| **Analisis Jaringan**  | Stealth address yang tidak dapat dilacak      |
| **Korelasi Transaksi** | Ephemeral keys mencegah pelacakan             |

### Keamanan PIN

- **Panjang**: 6 digit (10^6 = 1.000.000 kombinasi)
- **Rate Limiting**: 5 percobaan gagal → lockout 15 menit
- **Penyimpanan**: Hanya hash yang disimpan (bukan PIN plain)
- **Verifikasi**: Perbandingan hash (bukan dekripsi)

---

## Detail Implementasi

### Struktur File

```
lib/
├── blockchain/
│   ├── meta-keys.ts          # Penurunan kunci deterministik
│   ├── recovery.ts           # Logika recovery kunci
│   ├── registry.ts           # Interaksi registry blockchain
│   └── stealth.ts            # Generasi stealth address
├── utils/
│   ├── wallet-signature.ts   # Manajemen wallet signature
│   └── pin.ts                # Validasi dan penyimpanan PIN
components/
└── auth/
    └── PINInput.tsx          # Komponen input PIN
```

### Fungsi Utama

#### 1. Penurunan Meta Key

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

#### 3. Manajemen PIN

```typescript
validatePIN(pin: string): { valid: boolean; error?: string }
storePINHash(pinHash: string, walletAddress: string): void
verifyPIN(pin: string, walletAddress: string): boolean
checkPINLockout(walletAddress: string): { locked: boolean }
```

#### 4. Recovery Kunci

```typescript
recoverMetaKeys(
  walletAddress: string,
  pin: string,
  signer: ethers.Signer
): Promise<MetaKeys>
```

---

## Referensi API

### Modul Meta Keys

#### `deriveMetaKeys()`

Menurunkan meta keys deterministik dari wallet signature dan PIN.

**Parameter:**

- `walletAddress: string` - Alamat wallet pengguna
- `walletSignature: string` - Tanda tangan wallet (dari signMessage)
- `pin: string` - PIN 6 digit

**Return:**

```typescript
{
  metaViewPriv: string;
  metaViewPub: string;
  metaSpendPriv: string;
  metaSpendPub: string;
}
```

**Contoh:**

```typescript
const keys = await deriveMetaKeys("0x1234...", "0xabcd...", "123456");
```

### Modul Wallet Signature

#### `getOrCreateWalletSignature()`

Mengambil wallet signature yang di-cache atau meminta yang baru.

**Parameter:**

- `signer: ethers.Signer` - Privy signer
- `walletAddress: string` - Alamat wallet

**Return:** `Promise<string>` - Wallet signature

**Contoh:**

```typescript
const signature = await getOrCreateWalletSignature(signer, walletAddress);
```

### Modul PIN

#### `validatePIN()`

Memvalidasi format PIN (6 digit).

**Parameter:**

- `pin: string` - PIN yang akan divalidasi

**Return:**

```typescript
{ valid: boolean; error?: string }
```

#### `verifyPIN()`

Memverifikasi PIN terhadap hash yang disimpan.

**Parameter:**

- `pin: string` - PIN yang akan diverifikasi
- `walletAddress: string` - Alamat wallet

**Return:** `boolean`

#### `checkPINLockout()`

Memeriksa apakah wallet terkunci karena percobaan gagal.

**Parameter:**

- `walletAddress: string` - Alamat wallet

**Return:**

```typescript
{ locked: boolean; remainingTime?: number }
```

### Modul Recovery

#### `recoverMetaKeys()`

Merecover meta keys dari wallet + PIN.

**Parameter:**

- `walletAddress: string` - Alamat wallet
- `pin: string` - PIN 6 digit
- `signer: ethers.Signer` - Privy signer

**Return:** `Promise<MetaKeys>`

**Throws:**

- `Error` jika PIN tidak valid
- `Error` jika wallet terkunci

---

## Panduan Migrasi

### Dari Random Keys ke Deterministic Keys

#### Langkah 1: Update Generasi Kunci

Ganti:

```typescript
const keys = await generateStealthKeys(); // Random
```

Dengan:

```typescript
const signature = await getOrCreateWalletSignature(signer, walletAddress);
const keys = await deriveMetaKeys(walletAddress, signature, pin); // Deterministic
```

#### Langkah 2: Tambahkan Input PIN

Tambahkan komponen input PIN ke onboarding:

```typescript
<PINInput
  onComplete={(pin) => {
    // Lanjutkan dengan registrasi
  }}
  onError={(error) => {
    setError(error);
  }}
/>
```

#### Langkah 3: Update Penyimpanan

Hapus:

- Penyimpanan kunci di database
- Mekanisme backup kunci

Tambahkan:

- Penyimpanan PIN hash (localStorage)
- Caching wallet signature (localStorage)

#### Langkah 4: Update Recovery

Ganti restore kunci dengan recovery berbasis PIN:

```typescript
// Lama: Restore dari backup
const keys = await restoreKeysFromBackup(backupData);

// Baru: Recover dari wallet + PIN
const keys = await recoverMetaKeys(walletAddress, pin, signer);
```

### Migrasi untuk User Existing

1. **Minta PIN**: Minta user existing untuk set PIN
2. **Turunkan Kunci Baru**: Generate kunci deterministik
3. **Update Registrasi**: Re-register dengan metaViewPub baru (jika perlu)
4. **Hapus Kunci Lama**: Bersihkan kunci random lama

---

## Best Practices

### 1. Manajemen PIN

- ✅ Selalu validasi format PIN (6 digit)
- ✅ Implementasikan rate limiting (5 percobaan, lockout 15 menit)
- ✅ Simpan hanya PIN hash (jangan pernah PIN plain)
- ✅ Hapus PIN dari memori setelah digunakan

### 2. Wallet Signature

- ✅ Cache signature di localStorage (operasi sekali pakai)
- ✅ Gunakan format pesan yang konsisten
- ✅ Jangan pernah berbagi signature dengan pihak ketiga

### 3. Penurunan Kunci

- ✅ Selalu gunakan domain separation
- ✅ Gunakan random yang aman untuk ephemeral keys
- ✅ Jangan pernah log atau expose private keys

### 4. Keamanan

- ✅ Implementasikan PIN lockout setelah percobaan gagal
- ✅ Hapus data sensitif dari memori
- ✅ Gunakan penyimpanan yang aman untuk PIN hash
- ✅ Validasi semua input sebelum diproses

### 5. Error Handling

- ✅ Berikan pesan error yang jelas
- ✅ Jangan ungkapkan apakah PIN benar (rate limiting)
- ✅ Log event keamanan (bukan data sensitif)
- ✅ Tangani kegagalan jaringan dengan baik

---

## FAQ

### Q: Apa yang terjadi jika saya lupa PIN?

**A:** Anda tidak dapat recover kunci privasi tanpa PIN. Namun, wallet Anda masih berfungsi untuk transaksi reguler. Anda perlu mendaftarkan ulang username dengan PIN baru.

### Q: Bisakah saya mengubah PIN?

**A:** Mengubah PIN memerlukan re-derive kunci dan re-register username di blockchain. Ini adalah fitur keamanan untuk mencegah kompromi kunci.

### Q: Apakah PIN saya disimpan dengan aman?

**A:** Hanya hash dari PIN yang disimpan (SHA-256). PIN plain tidak pernah disimpan atau ditransmisikan.

### Q: Bagaimana jika seseorang mencuri wallet saya?

**A:** Mereka masih membutuhkan PIN Anda untuk menurunkan kunci privasi. Wallet saja tidak cukup.

### Q: Bisakah saya menggunakan PIN yang sama di beberapa perangkat?

**A:** Ya! Karena kunci deterministik, wallet + PIN yang sama = kunci yang sama di perangkat apa pun.

### Q: Apakah saya perlu backup kunci saya?

**A:** Tidak! Kunci deterministik dan dapat di-recover dengan wallet + PIN. Ingat saja PIN Anda.

---

## Referensi

- [EIP-712: Typed Structured Data Hashing](https://eips.ethereum.org/EIPS/eip-712)
- [Stealth Addresses](https://vitalik.ca/general/2023/01/20/stealth.html)
- [Deterministic Key Derivation](https://en.wikipedia.org/wiki/Key_derivation_function)

---

## Dukungan

Untuk pertanyaan atau masalah, silakan hubungi tim Cypher Wallet atau buka issue di GitHub.
