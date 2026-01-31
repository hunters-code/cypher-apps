import { Urbanist } from "next/font/google";
import localFont from "next/font/local";

import { LandingLayoutWrapper } from "@/components/layout/landing-layout-wrapper";
import { MetaTags } from "@/components/meta-tags";
import { MiniAppProvider } from "@/components/miniapp-provider";
import { AuthProvider } from "@/providers/AuthProvider";
import PrivyProvider from "@/providers/PrivyProvider";

import type { Metadata } from "next";

import "./globals.css";

const satoshi = localFont({
  src: [
    {
      path: "../fonts/Satoshi/Satoshi-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/Satoshi/Satoshi-LightItalic.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../fonts/Satoshi/Satoshi-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Satoshi/Satoshi-Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../fonts/Satoshi/Satoshi-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Satoshi/Satoshi-MediumItalic.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../fonts/Satoshi/Satoshi-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/Satoshi/Satoshi-BoldItalic.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../fonts/Satoshi/Satoshi-Black.otf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../fonts/Satoshi/Satoshi-BlackItalic.otf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const appUrl =
    process.env.NEXT_PUBLIC_URL || "https://cypher-apps.vercel.app";
  const appName = "Cypher Wallet";

  return {
    title: appName,
    description:
      "Your crypto, truly private. Enjoy cash-level privacy on the blockchain.",
    other: {
      "base:app_id": "6952106ac63ad876c90817b6",
      "fc:miniapp": JSON.stringify({
        version: "next",
        imageUrl: `${appUrl}/embed-image.png`,
        button: {
          title: `Launch ${appName}`,
          action: {
            type: "launch_miniapp",
            name: appName,
            url: appUrl,
            splashImageUrl: `${appUrl}/splash-image.png`,
            splashBackgroundColor: "#000000",
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="base:app_id" content="6952106ac63ad876c90817b6" />
      </head>
      <body
        className={`${satoshi.variable} ${urbanist.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <MetaTags />
        <PrivyProvider>
          <AuthProvider>
            <MiniAppProvider>
              <LandingLayoutWrapper>{children}</LandingLayoutWrapper>
            </MiniAppProvider>
          </AuthProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}
