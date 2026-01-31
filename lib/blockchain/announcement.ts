import { ethers } from "ethers";

import { ANNOUNCEMENT_ADDRESS, ANNOUNCEMENT_ABI } from "@/lib/constants";

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

    const ephemeralKeyBytes = ethers.isHexString(ephemeralPublicKey)
      ? ephemeralPublicKey
      : ethers.toUtf8Bytes(ephemeralPublicKey);

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
    throw error;
  }
}

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
