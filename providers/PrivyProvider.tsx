"use client";

import { PrivyProvider as PrivyDefaultProvider } from "@privy-io/react-auth";

export default function PrivyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivyDefaultProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
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
