import { secp256k1 } from "@noble/curves/secp256k1";
import { ethers } from "ethers";

export interface StealthKeys {
  viewingKey: string;
  viewingKeyPrivate: string;
  spendingKey: string;
  spendingKeyPrivate: string;
}

export interface StealthAddressResult {
  stealthAddress: string;
  ephemeralPublicKey: string;
  ephemeralPrivateKey: string;
}

export async function generateStealthKeys(): Promise<StealthKeys> {
  const viewingKeyWallet = ethers.Wallet.createRandom();
  const viewingKeyPrivate = viewingKeyWallet.privateKey;
  const viewingKeySigningKey = new ethers.SigningKey(viewingKeyPrivate);
  const viewingKeyPublic = viewingKeySigningKey.compressedPublicKey;

  const spendingKeyWallet = ethers.Wallet.createRandom();
  const spendingKeyPrivate = spendingKeyWallet.privateKey;
  const spendingKeySigningKey = new ethers.SigningKey(spendingKeyPrivate);
  const spendingKeyPublic = spendingKeySigningKey.compressedPublicKey;

  return {
    viewingKey: viewingKeyPublic,
    viewingKeyPrivate,
    spendingKey: spendingKeyPublic,
    spendingKeyPrivate,
  };
}

export function generateStealthAddress(
  recipientViewingKey: string,
  ephemeralPrivateKey?: string
): StealthAddressResult {
  const ephemeralKey =
    ephemeralPrivateKey || ethers.Wallet.createRandom().privateKey;
  const ephemeralSigningKey = new ethers.SigningKey(ephemeralKey);
  const ephemeralPublicKey = ephemeralSigningKey.compressedPublicKey;

  let sharedSecret: string;
  try {
    const recipientPublicKeyPoint = secp256k1.ProjectivePoint.fromHex(
      recipientViewingKey.slice(2)
    );
    const ephemeralPrivateKeyBytes = ethers.getBytes(ephemeralKey);
    const ephemeralPrivateKeyBigInt = BigInt(
      "0x" + ethers.hexlify(ephemeralPrivateKeyBytes).slice(2)
    );
    const sharedPoint = recipientPublicKeyPoint.multiply(
      ephemeralPrivateKeyBigInt
    );
    const sharedPointBytes = sharedPoint.toRawBytes(true);
    sharedSecret = ethers.keccak256(sharedPointBytes);
  } catch {
    sharedSecret = ethers.keccak256(
      ethers.concat([
        ethers.getBytes(ephemeralKey),
        ethers.getBytes(recipientViewingKey),
      ])
    );
  }

  const stealthAddress = ethers.getAddress(
    ethers.dataSlice(sharedSecret, 0, 20)
  );

  return {
    stealthAddress,
    ephemeralPublicKey,
    ephemeralPrivateKey: ephemeralKey,
  };
}

export function computeStealthAddress(
  viewingKeyPrivate: string,
  ephemeralPublicKey: string
): string {
  let sharedSecret: string;
  try {
    const ephemeralPublicKeyPoint = secp256k1.ProjectivePoint.fromHex(
      ephemeralPublicKey.slice(2)
    );
    const viewingKeyPrivateBytes = ethers.getBytes(viewingKeyPrivate);
    const viewingKeyPrivateBigInt = BigInt(
      "0x" + ethers.hexlify(viewingKeyPrivateBytes).slice(2)
    );
    const sharedPoint = ephemeralPublicKeyPoint.multiply(
      viewingKeyPrivateBigInt
    );
    const sharedPointBytes = sharedPoint.toRawBytes(true);
    sharedSecret = ethers.keccak256(sharedPointBytes);
  } catch {
    sharedSecret = ethers.keccak256(
      ethers.concat([
        ethers.getBytes(viewingKeyPrivate),
        ethers.getBytes(ephemeralPublicKey),
      ])
    );
  }

  const stealthAddress = ethers.getAddress(
    ethers.dataSlice(sharedSecret, 0, 20)
  );

  return stealthAddress;
}

export function isValidStealthAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}
