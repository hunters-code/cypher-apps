import { NextResponse } from "next/server";

import { ethers } from "ethers";

import { checkUsernameAvailability } from "@/lib/blockchain/registry";
import { REGISTRY_ADDRESS, REGISTRY_ABI } from "@/lib/constants";

interface RegisterRequest {
  username: string;
  viewingKey: string;
  walletAddress: string;
  signature: string;
}

const rateLimits = new Map<string, { count: number; resetAt: number }>();

async function checkRateLimit(
  key: string
): Promise<{ allowed: boolean; remaining?: number }> {
  const limit = rateLimits.get(key);
  const now = Date.now();

  if (!limit || now > limit.resetAt) {
    return { allowed: true };
  }

  if (limit.count >= 1) {
    const remaining = Math.ceil((limit.resetAt - now) / 1000);
    return { allowed: false, remaining };
  }

  return { allowed: true };
}

async function recordRateLimit(key: string): Promise<void> {
  const now = Date.now();
  rateLimits.set(key, {
    count: 1,
    resetAt: now + 86400000,
  });
}

function verifyRegistrationRequest(
  username: string,
  walletAddress: string,
  signature: string
): boolean {
  try {
    const message = `Register @${username} for ${walletAddress}`;
    const recovered = ethers.verifyMessage(message, signature);
    return recovered.toLowerCase() === walletAddress.toLowerCase();
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { username, viewingKey, walletAddress, signature }: RegisterRequest =
      await request.json();

    if (!username || !viewingKey || !walletAddress || !signature) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!verifyRegistrationRequest(username, walletAddress, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const rateLimitKey = `register_${walletAddress.toLowerCase()}`;
    const rateLimit = await checkRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          remaining: rateLimit.remaining,
        },
        { status: 429 }
      );
    }

    const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL;
    if (!rpcUrl) {
      return NextResponse.json(
        { error: "RPC URL not configured" },
        { status: 500 }
      );
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const isAvailable = await checkUsernameAvailability(provider, username);
    if (!isAvailable) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;
    if (!relayerPrivateKey) {
      return NextResponse.json(
        { error: "Relayer wallet not configured" },
        { status: 500 }
      );
    }

    const relayerWallet = new ethers.Wallet(relayerPrivateKey, provider);

    const registry = new ethers.Contract(
      REGISTRY_ADDRESS,
      REGISTRY_ABI,
      relayerWallet
    );

    const viewingKeyBytes = ethers.getBytes(viewingKey);
    const tx = await registry.registerID(username, viewingKeyBytes);
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error("Transaction receipt not found");
    }

    await recordRateLimit(rateLimitKey);

    return NextResponse.json({
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof Error) {
      if (error.message.includes("already registered")) {
        return NextResponse.json(
          { error: "Username is already registered" },
          { status: 400 }
        );
      }

      if (error.message.includes("insufficient funds")) {
        return NextResponse.json(
          { error: "Insufficient funds for gas" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
