import { ethers } from "ethers";

import { REGISTRY_ADDRESS, REGISTRY_ABI } from "@/lib/constants";

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
    throw error;
  }
}

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
    throw error;
  }
}

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

    if (username && typeof username === "string" && username.trim() !== "") {
      return username;
    }

    return "";
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      const errorString = String(error).toLowerCase();

      const isUserNotRegistered =
        errorMessage.includes("user not registered") ||
        errorString.includes("user not registered") ||
        errorMessage.includes("execution reverted") ||
        (errorMessage.includes("reverted") &&
          errorMessage.includes("user not registered"));

      if (isUserNotRegistered) {
        return "";
      }
    }
    throw error;
  }
}

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

    const address = await (
      registry as unknown as {
        getAddress: (username: string) => Promise<string>;
      }
    ).getAddress(username);
    return address;
  } catch (error) {
    throw error;
  }
}

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
    throw error;
  }
}

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
