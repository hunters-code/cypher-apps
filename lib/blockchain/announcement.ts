/**
 * Announcement Contract Interactions
 * Handles stealth address announcements
 */

import { ethers } from "ethers";

import { ANNOUNCEMENT_ADDRESS, ANNOUNCEMENT_ABI } from "@/lib/constants";

/**
 * Announce a stealth address transaction
 * This is called by the sender when making a private transfer
 */
export async function announceStealthTransaction(
  signer: ethers.Signer,
  stealthAddress: string,
  ephemeralPublicKey: string,
  metadata?: {
    amount?: string;
    tokenAddress?: string;
    tokenSymbol?: string;
    message?: string;
  }
): Promise<ethers.ContractTransactionReceipt> {
  try {
    const announcementContract = new ethers.Contract(
      ANNOUNCEMENT_ADDRESS,
      ANNOUNCEMENT_ABI,
      signer
    );

    // Convert ephemeral public key to bytes
    const ephemeralKeyBytes = ethers.isHexString(ephemeralPublicKey)
      ? ephemeralPublicKey
      : ethers.toUtf8Bytes(ephemeralPublicKey);

    // Encode metadata as JSON string, then to bytes (hex string format)
    const metadataBytes = metadata
      ? ethers.toUtf8Bytes(JSON.stringify(metadata))
      : "0x";

    const tx = await announcementContract.announce(
      stealthAddress,
      ephemeralKeyBytes,
      metadataBytes
    );

    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error("Transaction receipt not found");
    }

    return receipt;
  } catch (error) {
    console.error("Error announcing stealth transaction:", error);
    throw error;
  }
}

/**
 * Listen for announcement events
 */
export async function listenForAnnouncements(
  provider: ethers.Provider,
  callback: (
    sender: string,
    stealthAddress: string,
    ephemeralPublicKey: string,
    metadata: string
  ) => void
): Promise<void> {
  const announcementContract = new ethers.Contract(
    ANNOUNCEMENT_ADDRESS,
    ANNOUNCEMENT_ABI,
    provider
  );

  announcementContract.on(
    "Announcement",
    (
      sender: string,
      stealthAddress: string,
      ephemeralPublicKey: string,
      metadata: string
    ) => {
      callback(sender, stealthAddress, ephemeralPublicKey, metadata);
    }
  );
}
