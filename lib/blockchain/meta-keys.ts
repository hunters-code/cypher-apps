import { ethers } from "ethers";

export interface MetaKeys {
  metaViewPriv: string;
  metaViewPub: string;
  metaSpendPriv: string;
  metaSpendPub: string;
}

const VIEW_DOMAIN = "Cypher View Authority | Deterministic Derivation";
const SPEND_DOMAIN = "Cypher Spend Authority | Deterministic Derivation";

function derivePrivateKeyFromSeed(seed: Uint8Array): string {
  if (seed.length !== 32) {
    throw new Error("Seed must be 32 bytes");
  }

  const seedHex = ethers.hexlify(seed);
  let privateKey = ethers.keccak256(seedHex);

  while (!isValidPrivateKey(privateKey)) {
    privateKey = ethers.keccak256(privateKey);
  }

  return privateKey;
}

function isValidPrivateKey(privateKey: string): boolean {
  try {
    const key = BigInt(privateKey);
    const maxKey = BigInt(
      "0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"
    );
    const zero = BigInt(0);
    return key > zero && key < maxKey;
  } catch {
    return false;
  }
}

function derivePublicKey(privateKey: string): string {
  const signingKey = new ethers.SigningKey(privateKey);
  return signingKey.compressedPublicKey;
}

export async function deriveMetaKeys(
  walletAddress: string,
  walletSignature: string,
  pin: string
): Promise<MetaKeys> {
  const viewSeedInput = ethers.concat([
    ethers.toUtf8Bytes(walletSignature),
    ethers.toUtf8Bytes(pin),
    ethers.toUtf8Bytes(VIEW_DOMAIN),
  ]);

  const spendSeedInput = ethers.concat([
    ethers.toUtf8Bytes(walletSignature),
    ethers.toUtf8Bytes(pin),
    ethers.toUtf8Bytes(SPEND_DOMAIN),
  ]);

  const viewSeedHash = ethers.sha512(viewSeedInput);
  const spendSeedHash = ethers.sha512(spendSeedInput);

  const viewSeed = ethers.getBytes(viewSeedHash).slice(0, 32);
  const spendSeed = ethers.getBytes(spendSeedHash).slice(0, 32);

  const metaViewPriv = derivePrivateKeyFromSeed(viewSeed);
  const metaViewPub = derivePublicKey(metaViewPriv);

  const metaSpendPriv = derivePrivateKeyFromSeed(spendSeed);
  const metaSpendPub = derivePublicKey(metaSpendPriv);

  return {
    metaViewPriv,
    metaViewPub,
    metaSpendPriv,
    metaSpendPub,
  };
}
