import { ethers } from "ethers";

import { verifyPIN, checkPINLockout } from "@/lib/utils/pin";
import {
  getCachedWalletSignature,
  requestWalletSignature,
} from "@/lib/utils/wallet-signature";

import { deriveMetaKeys, type MetaKeys } from "./meta-keys";

export async function recoverMetaKeys(
  walletAddress: string,
  pin: string,
  signer: ethers.Signer
): Promise<MetaKeys> {
  const lockoutStatus = checkPINLockout(walletAddress);
  if (lockoutStatus.locked) {
    throw new Error(
      `Wallet is locked. Please try again in ${lockoutStatus.remainingTime} seconds.`
    );
  }

  if (!verifyPIN(pin, walletAddress)) {
    throw new Error("PIN is invalid");
  }

  let signature = getCachedWalletSignature(walletAddress);
  if (!signature) {
    signature = await requestWalletSignature(signer, walletAddress);
  }

  const keys = await deriveMetaKeys(walletAddress, signature, pin);

  return keys;
}
