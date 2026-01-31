import { ethers } from "ethers";

import { scanForIncomingTransfers } from "./scanner";
import { AvailableToken } from "../constants/tokens";

export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI?: string;
}

export const BASE_TOKENS: Record<string, TokenInfo> = {
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    address: "native",
    decimals: 18,
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
  },
  WETH: {
    symbol: "WETH",
    name: "Wrapped Ethereum",
    address: "0x4200000000000000000000000000000000000006",
    decimals: 18,
  },
  CDT: {
    symbol: "CDT",
    name: "Cypher Demo Token",
    address: "0xF80eE164f12a6FdB48c0E58e321d100CdDA508bC",
    decimals: 18,
  },
};

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function transfer(address to, uint256 amount) returns (bool)",
] as const;

export async function getNativeBalance(
  provider: ethers.Provider,
  address: string
): Promise<string> {
  try {
    const normalizedAddress = ethers.getAddress(address);
    const balance = await provider.getBalance(normalizedAddress);
    return ethers.formatEther(balance);
  } catch {
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
  } catch {
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
  viewingKeyPrivate: string
): Promise<string[]> {
  try {
    const events = await scanForIncomingTransfers(provider, viewingKeyPrivate);

    const stealthAddresses = new Set<string>();
    events.forEach((event) => {
      stealthAddresses.add(event.stealthAddress.toLowerCase());
    });

    return Array.from(stealthAddresses);
  } catch {
    return [];
  }
}

export async function getTokenBalanceWithStealth(
  provider: ethers.Provider,
  tokenInfo: AvailableToken,
  mainAddress: string,
  stealthAddresses: string[]
): Promise<string> {
  try {
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
        } catch {}
      })
    );

    if (tokenInfo.address === "native") {
      return ethers.formatEther(totalBalance);
    }
    return ethers.formatUnits(totalBalance, tokenInfo.decimals);
  } catch (error) {
    console.error(`Error getting balance for ${tokenInfo.symbol}:`, error);
    return "0";
  }
}

export async function getMultipleTokenBalancesWithStealth(
  provider: ethers.Provider,
  tokens: AvailableToken[],
  mainAddress: string,
  viewingKeyPrivate: string | null
): Promise<Record<string, string>> {
  const balances: Record<string, string> = {};

  let stealthAddresses: string[] = [];
  if (viewingKeyPrivate) {
    stealthAddresses = await getStealthAddresses(provider, viewingKeyPrivate);
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

export async function sendToken(
  signer: ethers.Signer,
  tokenInfo: TokenInfo,
  toAddress: string,
  amount: string
): Promise<ethers.TransactionReceipt | null> {
  const provider = signer.provider;
  if (!provider) {
    throw new Error("Provider not available");
  }

  const signerAddress = await signer.getAddress();
  const ethBalance = await provider.getBalance(signerAddress);

  if (tokenInfo.address === "native") {
    const amountInWei = ethers.parseEther(amount);
    const estimatedGas = await provider.estimateGas({
      from: signerAddress,
      to: toAddress,
      value: amountInWei,
    });
    const gasPrice = await provider.getFeeData();
    const gasCost = estimatedGas * (gasPrice.gasPrice || BigInt(0));

    if (ethBalance < amountInWei + gasCost) {
      throw new Error(
        `Insufficient ETH balance. Need ${ethers.formatEther(amountInWei + gasCost)} ETH (${ethers.formatEther(amountInWei)} for transfer + ${ethers.formatEther(gasCost)} for gas), but have ${ethers.formatEther(ethBalance)} ETH`
      );
    }

    const tx = await signer.sendTransaction({
      to: toAddress,
      value: amountInWei,
    });
    return await tx.wait();
  } else {
    const tokenContract = new ethers.Contract(
      tokenInfo.address,
      ERC20_ABI,
      signer
    );
    const amountInWei = ethers.parseUnits(amount, tokenInfo.decimals);

    const estimatedGas = await tokenContract.transfer.estimateGas(
      toAddress,
      amountInWei
    );
    const gasPrice = await provider.getFeeData();
    const gasCost = estimatedGas * (gasPrice.gasPrice || BigInt(0));

    if (ethBalance < gasCost) {
      throw new Error(
        `Insufficient ETH for gas. Need ${ethers.formatEther(gasCost)} ETH for gas fee, but have ${ethers.formatEther(ethBalance)} ETH. Please add ETH to your wallet to pay for transaction fees.`
      );
    }

    const tx = await tokenContract.transfer(toAddress, amountInWei);
    return await tx.wait();
  }
}
