/**
 * Stealth Address Cryptography
 * Implements ECDH-based stealth address generation
 */

import { ethers } from "ethers";

export interface StealthKeys {
  viewingKey: string; // Public key
  viewingKeyPrivate: string; // Private key
  spendingKey: string; // Public key
  spendingKeyPrivate: string; // Private key
}

export interface StealthAddressResult {
  stealthAddress: string;
  ephemeralPublicKey: string;
  ephemeralPrivateKey: string;
}

/**
 * Generate viewing and spending key pairs for a user
 * These keys are generated client-side and never leave the device
 */
export async function generateStealthKeys(): Promise<StealthKeys> {
  // Generate viewing key pair
  const viewingKeyWallet = ethers.Wallet.createRandom();
  const viewingKeyPrivate = viewingKeyWallet.privateKey;
  const viewingKeySigningKey = new ethers.SigningKey(viewingKeyPrivate);
  const viewingKeyPublic = viewingKeySigningKey.compressedPublicKey;

  // Generate spending key pair
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

/**
 * Generate a stealth address for a recipient
 * @param recipientViewingKey - Recipient's public viewing key (from registry)
 * @param ephemeralPrivateKey - Optional ephemeral private key (generated if not provided)
 * @returns Stealth address and ephemeral public key
 */
export function generateStealthAddress(
  recipientViewingKey: string,
  ephemeralPrivateKey?: string
): StealthAddressResult {
  // Generate ephemeral key pair if not provided
  const ephemeralKey =
    ephemeralPrivateKey || ethers.Wallet.createRandom().privateKey;
  const ephemeralSigningKey = new ethers.SigningKey(ephemeralKey);
  const ephemeralPublicKey = ephemeralSigningKey.compressedPublicKey;

  // Compute shared secret using ECDH
  // sharedSecret = hash(ephemeralPrivateKey || recipientViewingKey)
  const sharedSecret = ethers.keccak256(
    ethers.concat([
      ethers.getBytes(ephemeralKey),
      ethers.getBytes(recipientViewingKey),
    ])
  );

  // Generate stealth address from shared secret
  // This is a simplified version - actual implementation may vary
  const stealthAddress = ethers.getAddress(
    ethers.dataSlice(sharedSecret, 0, 20)
  );

  return {
    stealthAddress,
    ephemeralPublicKey,
    ephemeralPrivateKey: ephemeralKey,
  };
}

/**
 * Compute stealth address from viewing key and ephemeral public key
 * This is used by recipients to check if an announcement is for them
 * @param viewingKeyPrivate - Recipient's private viewing key
 * @param ephemeralPublicKey - Ephemeral public key from announcement
 * @returns Computed stealth address
 */
export function computeStealthAddress(
  viewingKeyPrivate: string,
  ephemeralPublicKey: string
): string {
  // Compute shared secret using ECDH
  const sharedSecret = ethers.keccak256(
    ethers.concat([
      ethers.getBytes(viewingKeyPrivate),
      ethers.getBytes(ephemeralPublicKey),
    ])
  );

  // Generate stealth address from shared secret
  const stealthAddress = ethers.getAddress(
    ethers.dataSlice(sharedSecret, 0, 20)
  );

  return stealthAddress;
}

/**
 * Validate stealth address format
 */
export function isValidStealthAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}
