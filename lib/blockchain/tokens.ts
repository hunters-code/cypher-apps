import { ethers } from "ethers";

import { scanForIncomingTransfers } from "./scanner";
import { AvailableToken } from "../constants/tokens";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
] as const;

export async function getNativeBalance(
  provider: ethers.Provider,
  address: string
): Promise<string> {
  try {
    const normalizedAddress = ethers.getAddress(address);
    const balance = await provider.getBalance(normalizedAddress);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("Error fetching native balance:", error);
    return "0";
  }
}

export async function getERC20Balance(
  provider: ethers.Provider,
  tokenAddress: string,
  userAddress: string,
  decimals: number
): Promise<string> {
  try {
    const normalizedAddress = ethers.getAddress(userAddress);
    const normalizedTokenAddress = ethers.getAddress(tokenAddress);

    const tokenContract = new ethers.Contract(
      normalizedTokenAddress,
      ERC20_ABI,
      provider
    );
    const balance = await tokenContract.balanceOf(normalizedAddress);

    return ethers.formatUnits(balance, decimals);
  } catch (error) {
    console.error("Error fetching ERC20 balance:", error);
    return "0";
  }
}

export async function getTokenBalance(
  provider: ethers.Provider,
  tokenInfo: AvailableToken,
  userAddress: string
): Promise<string> {
  if (tokenInfo.address === "native") {
    return getNativeBalance(provider, userAddress);
  }
  return getERC20Balance(
    provider,
    tokenInfo.address,
    userAddress,
    tokenInfo.decimals
  );
}

export async function getMultipleTokenBalances(
  provider: ethers.Provider,
  tokens: AvailableToken[],
  userAddress: string
): Promise<Record<string, string>> {
  const balances: Record<string, string> = {};

  await Promise.all(
    tokens.map(async (token) => {
      const balance = await getTokenBalance(provider, token, userAddress);
      balances[token.symbol] = balance;
    })
  );

  return balances;
}

export async function getStealthAddresses(
  provider: ethers.Provider,
  viewingKeyPrivate: string,
  fromBlock: number = 0
): Promise<string[]> {
  try {
    const events = await scanForIncomingTransfers(
      provider,
      viewingKeyPrivate,
      fromBlock,
      "latest"
    );

    const stealthAddresses = new Set<string>();
    events.forEach((event) => {
      stealthAddresses.add(event.stealthAddress.toLowerCase());
    });

    return Array.from(stealthAddresses);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      errorMessage.includes("no backend is currently healthy") ||
      errorMessage.includes("UNKNOWN_ERROR") ||
      errorMessage.includes("could not coalesce error")
    ) {
      return [];
    }
    console.error("Error getting stealth addresses:", error);
    return [];
  }
}

export async function getTokenBalanceWithStealth(
  provider: ethers.Provider,
  tokenInfo: AvailableToken,
  mainAddress: string,
  stealthAddresses: string[]
): Promise<string> {
  let totalBalance = BigInt(0);

  const mainBalance = await getTokenBalance(provider, tokenInfo, mainAddress);
  if (tokenInfo.address === "native") {
    totalBalance += ethers.parseEther(mainBalance);
  } else {
    totalBalance += ethers.parseUnits(mainBalance, tokenInfo.decimals);
  }

  await Promise.all(
    stealthAddresses.map(async (stealthAddress) => {
      try {
        const balance = await getTokenBalance(
          provider,
          tokenInfo,
          stealthAddress
        );
        if (tokenInfo.address === "native") {
          totalBalance += ethers.parseEther(balance);
        } else {
          totalBalance += ethers.parseUnits(balance, tokenInfo.decimals);
        }
      } catch (error) {
        console.error(
          `Error fetching balance for stealth address ${stealthAddress}:`,
          error
        );
      }
    })
  );

  if (tokenInfo.address === "native") {
    return ethers.formatEther(totalBalance);
  }
  return ethers.formatUnits(totalBalance, tokenInfo.decimals);
}

export async function getMultipleTokenBalancesWithStealth(
  provider: ethers.Provider,
  tokens: AvailableToken[],
  mainAddress: string,
  viewingKeyPrivate: string | null,
  fromBlock: number = 0
): Promise<Record<string, string>> {
  const balances: Record<string, string> = {};

  let stealthAddresses: string[] = [];
  if (viewingKeyPrivate) {
    stealthAddresses = await getStealthAddresses(
      provider,
      viewingKeyPrivate,
      fromBlock
    );
  }

  await Promise.all(
    tokens.map(async (token) => {
      const balance = await getTokenBalanceWithStealth(
        provider,
        token,
        mainAddress,
        stealthAddresses
      );
      balances[token.symbol] = balance;
    })
  );

  return balances;
}
