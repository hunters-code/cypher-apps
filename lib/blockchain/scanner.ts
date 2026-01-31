import { ethers } from "ethers";

import {
  ANNOUNCEMENT_ADDRESS,
  ANNOUNCEMENT_ABI,
  BASE_CHAIN_ID,
} from "@/lib/constants";

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

function getBlockscoutUrl(): string {
  if (BASE_CHAIN_ID === 84532) {
    return "https://base-sepolia.blockscout.com";
  }
  return "https://base.blockscout.com";
}

interface BlockscoutTransaction {
  hash: string;
  block_number: number;
  timestamp: string;
  from: {
    hash: string;
  };
  to: {
    hash: string;
  } | null;
  method: string | null;
  decoded_input?: {
    parameters?: Array<{
      name: string;
      type: string;
      value: string;
    }>;
  };
  logs?: Array<{
    address: string | { hash: string };
    topics: string[];
    data: string;
  }>;
}

interface BlockscoutResponse {
  items: BlockscoutTransaction[];
  next_page_params: {
    page: string;
    page_size: string;
  } | null;
}

async function fetchTransactionLogs(
  blockscoutUrl: string,
  txHash: string
): Promise<
  Array<{
    address: string | { hash: string };
    topics: string[];
    data: string;
  }>
> {
  try {
    const response = await fetch(
      `${blockscoutUrl}/api/v2/transactions/${txHash}/logs`,
      {
        headers: {
          accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.items || [];
  } catch {
    return [];
  }
}

async function fetchTransactionsFromBlockscout(
  address: string
): Promise<BlockscoutTransaction[]> {
  const blockscoutUrl = getBlockscoutUrl();

  try {
    const url = `${blockscoutUrl}/api/v2/addresses/${address}/transactions`;

    const response = await fetch(url, {
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Blockscout API error: ${response.statusText}`);
    }

    const data: BlockscoutResponse = await response.json();
    const allTransactions = data.items || [];

    const transactionsWithLogs: BlockscoutTransaction[] = [];

    for (const tx of allTransactions) {
      if (!tx.to || tx.to.hash.toLowerCase() !== address.toLowerCase()) {
        continue;
      }

      if (tx.method !== "announce") {
        continue;
      }

      const logs = await fetchTransactionLogs(blockscoutUrl, tx.hash);

      transactionsWithLogs.push({
        ...tx,
        logs,
      });
    }

    return transactionsWithLogs;
  } catch {
    return [];
  }
}

type BlockscoutLog = {
  address: string | { hash: string };
  topics: string[];
  data: string;
};

function decodeAnnouncementEvent(
  log: BlockscoutLog,
  transactionHash: string,
  blockNumber: number,
  timestamp: string,
  transactionInput?: BlockscoutTransaction["decoded_input"]
): AnnouncementEvent | null {
  try {
    if (!log.topics || !log.topics.length) {
      return null;
    }

    const actualTopic = log.topics[0];

    const announcementContract = new ethers.Contract(
      ANNOUNCEMENT_ADDRESS,
      ANNOUNCEMENT_ABI,
      null
    );

    const iface = announcementContract.interface;

    let decodedLog: ethers.Result;
    let announcementEventFragment: ethers.EventFragment | null = null;

    try {
      announcementEventFragment = iface.getEvent("Announcement");
      if (announcementEventFragment) {
        const eventTopic = announcementEventFragment.topicHash;

        if (actualTopic === eventTopic) {
          decodedLog = iface.decodeEventLog(
            announcementEventFragment,
            log.data,
            log.topics
          );
        } else {
          throw new Error("Topic mismatch");
        }
      } else {
        throw new Error("Event fragment not found");
      }
    } catch {
      if (log.topics.length < 4) {
        return null;
      }

      const sender = ethers.getAddress("0x" + log.topics[1].slice(26));

      let stealthAddressStr = "";
      if (log.topics[2]) {
        stealthAddressStr = ethers.getAddress("0x" + log.topics[2].slice(26));
      } else {
        return null;
      }

      let ephemeralPublicKeyFromInput = "";
      if (transactionInput?.parameters) {
        const ephemeralParam = transactionInput.parameters.find(
          (p) => p.name === "ephemeralPubKey" || p.name === "ephemeralPublicKey"
        );
        if (ephemeralParam) {
          ephemeralPublicKeyFromInput = ephemeralParam.value;
        }
      }

      let ephemeralPublicKey = ephemeralPublicKeyFromInput || "0x";
      let metadata = "0x";

      if (transactionInput?.parameters) {
        const metadataParam = transactionInput.parameters.find(
          (p) => p.name === "metadata"
        );
        if (
          metadataParam &&
          metadataParam.value &&
          metadataParam.value !== "0x"
        ) {
          metadata = metadataParam.value;
        }
      }

      let blockNumberFromEvent = blockNumber;

      if (!ephemeralPublicKey || ephemeralPublicKey === "0x") {
        if (log.data && log.data !== "0x") {
          try {
            const abiCoder = ethers.AbiCoder.defaultAbiCoder();
            const decoded = abiCoder.decode(
              ["bytes", "bytes", "uint256", "uint256"],
              log.data
            );
            ephemeralPublicKey = decoded[0];
            metadata = decoded[1];
            blockNumberFromEvent = Number(decoded[2] || BigInt(blockNumber));
          } catch {
            try {
              const abiCoder = ethers.AbiCoder.defaultAbiCoder();
              const decoded = abiCoder.decode(
                ["bytes", "uint256", "uint256"],
                log.data
              );
              ephemeralPublicKey = decoded[0];
              metadata = "0x";
              blockNumberFromEvent = Number(decoded[1] || BigInt(blockNumber));
            } catch {
              return null;
            }
          }
        } else {
          return null;
        }
      } else {
        if (!metadata || metadata === "0x") {
          if (log.data && log.data !== "0x") {
            try {
              const abiCoder = ethers.AbiCoder.defaultAbiCoder();
              const decoded = abiCoder.decode(
                ["bytes", "uint256", "uint256"],
                log.data
              );
              metadata = decoded[0];
              blockNumberFromEvent = Number(decoded[1] || BigInt(blockNumber));
            } catch {
              metadata = log.data;
            }
          }
        }
      }

      let finalTimestamp: number;
      if (timestamp) {
        try {
          const date = new Date(timestamp);
          finalTimestamp = Math.floor(date.getTime() / 1000);
        } catch {
          finalTimestamp = Math.floor(Date.now() / 1000);
        }
      } else {
        finalTimestamp = Math.floor(Date.now() / 1000);
      }

      let finalMetadata = "0x";
      if (log.data && log.data !== "0x") {
        try {
          const abiCoder = ethers.AbiCoder.defaultAbiCoder();
          try {
            const decoded = abiCoder.decode(
              ["bytes", "bytes", "uint256", "uint256"],
              log.data
            );
            finalMetadata = decoded[1];
          } catch {
            try {
              const decoded = abiCoder.decode(
                ["bytes", "uint256", "uint256"],
                log.data
              );
              finalMetadata = decoded[0];
            } catch {
              if (transactionInput?.parameters) {
                const metadataParam = transactionInput.parameters.find(
                  (p) => p.name === "metadata"
                );
                if (metadataParam) {
                  finalMetadata = metadataParam.value;
                }
              }
            }
          }
        } catch {}
      }

      return {
        sender,
        stealthAddress: stealthAddressStr,
        ephemeralPublicKey: ephemeralPublicKey,
        metadata: finalMetadata,
        blockNumber: blockNumberFromEvent,
        timestamp: finalTimestamp,
        transactionHash: transactionHash,
      };
    }

    const decodedLogResult = decodedLog as ethers.Result;

    const sender = decodedLogResult.sender;
    const stealthAddressBytes32 = decodedLogResult.stealthAddress;
    const ephemeralPublicKey = decodedLogResult.ephemeralPublicKey;
    const metadata = decodedLogResult.metadata;
    const blockNumberFromEvent = decodedLogResult.blockNumber
      ? Number(decodedLogResult.blockNumber)
      : blockNumber;
    let timestampFromEvent: number;
    if (timestamp) {
      try {
        const date = new Date(timestamp);
        timestampFromEvent = Math.floor(date.getTime() / 1000);
      } catch {
        timestampFromEvent = Math.floor(Date.now() / 1000);
      }
    } else {
      timestampFromEvent = Math.floor(Date.now() / 1000);
    }

    const stealthAddressStr = ethers.getAddress(
      ethers.dataSlice(stealthAddressBytes32, 0, 20)
    );

    return {
      sender: ethers.getAddress(sender),
      stealthAddress: stealthAddressStr,
      ephemeralPublicKey: ephemeralPublicKey,
      metadata: metadata,
      blockNumber: blockNumberFromEvent,
      timestamp: timestampFromEvent,
      transactionHash: transactionHash,
    };
  } catch {
    return null;
  }
}

export async function scanForIncomingTransfers(
  provider: ethers.Provider,
  viewingKeyPrivate: string
): Promise<AnnouncementEvent[]> {
  try {
    const transactions =
      await fetchTransactionsFromBlockscout(ANNOUNCEMENT_ADDRESS);

    const matchingEvents: AnnouncementEvent[] = [];

    for (const tx of transactions) {
      const blockNumber = tx.block_number;
      const timestamp = tx.timestamp;

      if (!tx.logs || tx.logs.length === 0) {
        continue;
      }

      for (const log of tx.logs) {
        const logAddress =
          typeof log.address === "string"
            ? log.address
            : log.address?.hash || "";

        if (logAddress.toLowerCase() !== ANNOUNCEMENT_ADDRESS.toLowerCase()) {
          continue;
        }

        const event = decodeAnnouncementEvent(
          log,
          tx.hash,
          blockNumber,
          timestamp,
          tx.decoded_input
        );

        if (!event) {
          continue;
        }

        const computedStealthAddress = computeStealthAddress(
          viewingKeyPrivate,
          event.ephemeralPublicKey
        );

        const matchesEvent =
          computedStealthAddress.toLowerCase() ===
          event.stealthAddress.toLowerCase();
        const matchesSender =
          computedStealthAddress.toLowerCase() === event.sender.toLowerCase();

        if (matchesEvent || matchesSender) {
          matchingEvents.push({
            ...event,
            stealthAddress: computedStealthAddress,
          });
        }
      }
    }

    return matchingEvents;
  } catch {
    return [];
  }
}

export function parseMetadata(metadata: string): ParsedMetadata {
  try {
    if (metadata.startsWith("0x")) {
      try {
        const decoded = ethers.toUtf8String(metadata);
        return JSON.parse(decoded);
      } catch {
        return { message: metadata };
      }
    }

    return JSON.parse(metadata);
  } catch {
    return { message: metadata };
  }
}

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

    const stealthAddressBytes32 = ethers.zeroPadValue(
      ethers.getBytes(stealthAddress),
      32
    );

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
    throw error;
  }
}

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
        transactionHash: "",
      };
    });
  } catch (error) {
    throw error;
  }
}
