/**
 * Event Scanner for Stealth Address Transactions
 * Scans blockchain events to find incoming transfers
 */

import { ethers } from "ethers";

import { ANNOUNCEMENT_ADDRESS, ANNOUNCEMENT_ABI } from "@/lib/constants";

import { computeStealthAddress } from "./stealth";

export interface AnnouncementEvent {
  sender: string;
  stealthAddress: string;
  ephemeralPublicKey: string;
  metadata: string;
  blockNumber: number;
  timestamp: number;
  transactionHash: string;
}

export interface ParsedMetadata {
  amount?: string;
  tokenAddress?: string;
  tokenSymbol?: string;
  message?: string;
}

/**
 * Scan for incoming stealth address transactions
 * @param provider - Ethers provider
 * @param viewingKeyPrivate - User's private viewing key
 * @param fromBlock - Starting block number
 * @param toBlock - Ending block number (default: 'latest')
 * @returns Array of matching announcement events
 */
export async function scanForIncomingTransfers(
  provider: ethers.Provider,
  viewingKeyPrivate: string,
  fromBlock: number,
  toBlock: number | "latest" = "latest"
): Promise<AnnouncementEvent[]> {
  try {
    const announcementContract = new ethers.Contract(
      ANNOUNCEMENT_ADDRESS,
      ANNOUNCEMENT_ABI,
      provider
    );

    // Query all Announcement events
    const filter = announcementContract.filters.Announcement();
    const events = await announcementContract.queryFilter(
      filter,
      fromBlock,
      toBlock
    );

    const matchingEvents: AnnouncementEvent[] = [];

    // Process each event
    for (const event of events) {
      // Type guard: check if event is EventLog with args
      if (!("args" in event) || !event.args) continue;

      const {
        sender,
        stealthAddress: eventStealthAddress,
        ephemeralPublicKey,
        metadata,
        blockNumber,
        timestamp,
      } = event.args;

      // Compute stealth address from viewing key + ephemeral public key
      const computedStealthAddress = computeStealthAddress(
        viewingKeyPrivate,
        ephemeralPublicKey
      );

      // Convert event stealth address to address format for comparison
      const eventStealthAddressStr = ethers.getAddress(
        ethers.dataSlice(eventStealthAddress, 0, 20)
      );

      // Check if this stealth address matches (belongs to user)
      if (
        computedStealthAddress.toLowerCase() ===
        eventStealthAddressStr.toLowerCase()
      ) {
        // Get block timestamp if not provided in event
        let eventTimestamp = timestamp;
        if (!eventTimestamp || eventTimestamp === BigInt(0)) {
          const block = await provider.getBlock(Number(blockNumber));
          eventTimestamp = BigInt(block?.timestamp || 0);
        }

        matchingEvents.push({
          sender: ethers.getAddress(sender),
          stealthAddress: eventStealthAddressStr,
          ephemeralPublicKey: ephemeralPublicKey,
          metadata: metadata,
          blockNumber: Number(blockNumber),
          timestamp: Number(eventTimestamp),
          transactionHash: event.transactionHash,
        });
      }
    }

    return matchingEvents;
  } catch (error) {
    console.error("Error scanning for incoming transfers:", error);
    throw error;
  }
}

/**
 * Parse metadata from announcement event
 * Metadata format: encoded JSON or ABI-encoded data
 */
export function parseMetadata(metadata: string): ParsedMetadata {
  try {
    // Try to decode as JSON first
    if (metadata.startsWith("0x")) {
      // If it's hex, try to decode as UTF-8
      try {
        const decoded = ethers.toUtf8String(metadata);
        return JSON.parse(decoded);
      } catch {
        // If UTF-8 decode fails, return raw metadata
        return { message: metadata };
      }
    }

    // Try parsing as JSON string
    return JSON.parse(metadata);
  } catch {
    // If parsing fails, return as message
    return { message: metadata };
  }
}

/**
 * Announce a stealth address transaction
 * Called by sender when sending a private transfer
 * @param signer - Wallet signer
 * @param stealthAddress - Stealth address (as bytes32)
 * @param ephemeralPublicKey - Ephemeral public key (bytes)
 * @param metadata - Optional metadata (amount, token, etc.)
 * @returns Transaction receipt
 */
export async function announceStealthAddress(
  signer: ethers.Signer,
  stealthAddress: string,
  ephemeralPublicKey: string,
  metadata: string = "0x"
): Promise<ethers.ContractTransactionReceipt> {
  try {
    const announcementContract = new ethers.Contract(
      ANNOUNCEMENT_ADDRESS,
      ANNOUNCEMENT_ABI,
      signer
    );

    // Convert stealth address to bytes32
    const stealthAddressBytes32 = ethers.zeroPadValue(
      ethers.getBytes(stealthAddress),
      32
    );

    // Convert ephemeral public key to bytes if needed
    const ephemeralKeyBytes = ethers.isHexString(ephemeralPublicKey)
      ? ephemeralPublicKey
      : ethers.toUtf8Bytes(ephemeralPublicKey);

    const tx = await announcementContract.announce(
      stealthAddressBytes32,
      ephemeralKeyBytes,
      metadata
    );

    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error("Transaction receipt not found");
    }

    return receipt;
  } catch (error) {
    console.error("Error announcing stealth address:", error);
    throw error;
  }
}

/**
 * Get announcements for a specific stealth address
 * Note: This is less efficient than scanning with viewing key
 */
export async function getAnnouncementsForAddress(
  provider: ethers.Provider,
  stealthAddress: string,
  fromBlock: number,
  toBlock: number | "latest" = "latest"
): Promise<AnnouncementEvent[]> {
  try {
    const announcementContract = new ethers.Contract(
      ANNOUNCEMENT_ADDRESS,
      ANNOUNCEMENT_ABI,
      provider
    );

    // Convert stealth address to bytes32
    const stealthAddressBytes32 = ethers.zeroPadValue(
      ethers.getBytes(stealthAddress),
      32
    );

    const toBlockNumber =
      toBlock === "latest" ? await provider.getBlockNumber() : toBlock;

    const announcements = await announcementContract.getAnnouncements(
      stealthAddressBytes32,
      fromBlock,
      toBlockNumber
    );

    return announcements.map((announcement: unknown) => {
      const ann = announcement as {
        sender: string;
        stealthAddress: string;
        ephemeralPublicKey: string;
        metadata: string;
        blockNumber: bigint;
        timestamp: bigint;
      };

      return {
        sender: ethers.getAddress(ann.sender),
        stealthAddress: ethers.getAddress(
          ethers.dataSlice(ann.stealthAddress, 0, 20)
        ),
        ephemeralPublicKey: ann.ephemeralPublicKey,
        metadata: ann.metadata,
        blockNumber: Number(ann.blockNumber),
        timestamp: Number(ann.timestamp),
        transactionHash: "", // Not available from this function
      };
    });
  } catch (error) {
    console.error("Error getting announcements:", error);
    throw error;
  }
}
