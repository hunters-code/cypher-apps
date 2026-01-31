import { ethers } from "ethers";

import {
  verifyPIN,
  checkPINLockout,
  hashPIN,
  storePINHash,
} from "@/lib/utils/pin";
import {
  getCachedWalletSignature,
  requestWalletSignature,
} from "@/lib/utils/wallet-signature";

import { deriveMetaKeys, type MetaKeys } from "./meta-keys";
import { getViewingKey, getUsername } from "./registry";

export async function recoverMetaKeys(
  walletAddress: string,
  pin: string,
  signer: ethers.Signer,
  provider?: ethers.Provider
): Promise<MetaKeys> {
  const lockoutStatus = checkPINLockout(walletAddress);
  if (lockoutStatus.locked) {
    throw new Error(
      `Wallet is locked. Please try again in ${lockoutStatus.remainingTime} seconds.`
    );
  }

  const hasStoredPINHash =
    typeof window !== "undefined" &&
    !!localStorage.getItem(`cypher_pin_hash_${walletAddress.toLowerCase()}`);

  let signature = getCachedWalletSignature(walletAddress);
  if (!signature) {
    try {
      signature = await requestWalletSignature(signer, walletAddress);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("network changed") ||
          error.message.includes("NETWORK_ERROR"))
      ) {
        throw new Error(
          "Network error during signature. Please ensure you're on Base network and try again."
        );
      }
      throw error;
    }
  }

  if (hasStoredPINHash) {
    if (!verifyPIN(pin, walletAddress)) {
      throw new Error("PIN is invalid");
    }

    const keys = await deriveMetaKeys(walletAddress, signature, pin);
    return keys;
  } else if (provider) {
    const username = await getUsername(provider, walletAddress);
    if (!username || username.length === 0) {
      throw new Error("User is not registered");
    }

    const keys = await deriveMetaKeys(walletAddress, signature, pin);

    const blockchainViewingKey = await getViewingKey(provider, username);
    const generatedViewingKey = keys.metaViewPub;

    if (
      blockchainViewingKey.toLowerCase() !== generatedViewingKey.toLowerCase()
    ) {
      throw new Error("PIN is invalid");
    }

    storePINHash(hashPIN(pin), walletAddress);
    return keys;
  } else {
    throw new Error("Provider is required for recovery without PIN hash");
  }
}
