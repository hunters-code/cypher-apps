"use client";

import { PrivyProvider as PrivyDefaultProvider } from "@privy-io/react-auth";
import { baseSepolia } from "viem/chains";

export default function PrivyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivyDefaultProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        // appearance: { walletChainType: "ethereum-and-solana" },
      }}
    >
      {children}
    </PrivyDefaultProvider>
  );
}
