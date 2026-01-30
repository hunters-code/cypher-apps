/**
 * Registry Contract Interactions
 * Handles username registration and lookups
 */

import { ethers } from "ethers";

import { REGISTRY_ADDRESS, REGISTRY_ABI } from "@/lib/constants";

/**
 * Check if a username is available
 */
export async function checkUsernameAvailability(
  provider: ethers.Provider,
  username: string
): Promise<boolean> {
  try {
    const registry = new ethers.Contract(
      REGISTRY_ADDRESS,
      REGISTRY_ABI,
      provider
    );

    const isAvailable = await registry.isUsernameAvailable(username);
    return isAvailable;
  } catch (error) {
    console.error("Error checking username availability:", error);
    throw error;
  }
}

/**
 * Get viewing key for a username
 */
export async function getViewingKey(
  provider: ethers.Provider,
  username: string
): Promise<string> {
  try {
    const registry = new ethers.Contract(
      REGISTRY_ADDRESS,
      REGISTRY_ABI,
      provider
    );

    const viewingKey = await registry.getViewingKey(username);
    return viewingKey;
  } catch (error) {
    console.error("Error getting viewing key:", error);
    throw error;
  }
}

/**
 * Get username for an address
 * Returns empty string if user is not registered
 */
export async function getUsername(
  provider: ethers.Provider,
  address: string
): Promise<string> {
  try {
    const registry = new ethers.Contract(
      REGISTRY_ADDRESS,
      REGISTRY_ABI,
      provider
    );

    const username = await registry.getUsername(address);
    return username;
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      const errorString = String(error).toLowerCase();

      const isUserNotRegistered =
        errorMessage.includes("user not registered") ||
        errorString.includes("user not registered") ||
        (errorMessage.includes("reverted") &&
          errorMessage.includes("user not registered"));

      if (isUserNotRegistered) {
        return "";
      }
    }
    throw error;
  }
}

/**
 * Get address for a username
 */
export async function getAddress(
  provider: ethers.Provider,
  username: string
): Promise<string> {
  try {
    const registry = new ethers.Contract(
      REGISTRY_ADDRESS,
      REGISTRY_ABI,
      provider
    );

    // Use bracket notation to avoid conflict with ethers.Contract.getAddress()
    const address = await (
      registry as unknown as {
        getAddress: (username: string) => Promise<string>;
      }
    ).getAddress(username);
    return address;
  } catch (error) {
    console.error("Error getting address:", error);
    throw error;
  }
}

/**
 * Register a username with viewing key
 * @param signer - Wallet signer (from Privy or wagmi)
 * @param username - Username to register (without @)
 * @param viewingKeyPublic - Public viewing key (bytes)
 * @returns Transaction receipt
 */
export async function registerUsername(
  signer: ethers.Signer,
  username: string,
  viewingKeyPublic: string
): Promise<ethers.ContractTransactionReceipt> {
  try {
    const registry = new ethers.Contract(
      REGISTRY_ADDRESS,
      REGISTRY_ABI,
      signer
    );

    // Convert viewing key to bytes if it's a hex string
    const viewingKeyBytes =
      viewingKeyPublic.startsWith("0x") && viewingKeyPublic.length === 68
        ? viewingKeyPublic
        : ethers.toUtf8Bytes(viewingKeyPublic);

    const tx = await registry.registerID(username, viewingKeyBytes);
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error("Transaction receipt not found");
    }

    return receipt;
  } catch (error) {
    console.error("Error registering username:", error);
    throw error;
  }
}

/**
 * Listen for ID registration events
 */
export async function listenForRegistrations(
  provider: ethers.Provider,
  callback: (user: string, username: string, viewingKey: string) => void
): Promise<void> {
  const registry = new ethers.Contract(
    REGISTRY_ADDRESS,
    REGISTRY_ABI,
    provider
  );

  registry.on("IDRegistered", (user, username, viewingKeyPublic) => {
    callback(user, username, viewingKeyPublic);
  });
}
