export async function GET() {
  const appUrl =
    process.env.NEXT_PUBLIC_URL || "https://cypher-apps.vercel.app";

  const manifest = {
    accountAssociation: {
      header: "",
      payload: "",
      signature: "",
    },
    miniapp: {
      version: "1",
      name: "Cypher Wallet",
      homeUrl: appUrl,
      iconUrl: `${appUrl}/icon.png`,
      splashImageUrl: `${appUrl}/splash-image.png`,
      splashBackgroundColor: "#000000",
      webhookUrl: `${appUrl}/api/webhook`,
      subtitle: "Fast, fun, social",
      description:
        "Your crypto, truly private. Enjoy cash-level privacy on the blockchain.",
      screenshotUrls: [
        `${appUrl}/screenshot1.png`,
        `${appUrl}/screenshot2.png`,
        `${appUrl}/screenshot3.png`,
      ],
      primaryCategory: "finance",
      tags: ["wallet", "privacy", "crypto", "base"],
      heroImageUrl: `${appUrl}/og-image.png`,
      tagline: "Send to usernames without exposing your transaction history",
      ogTitle: "Cypher Wallet",
      ogDescription:
        "Your crypto, truly private. Enjoy cash-level privacy on the blockchain.",
      ogImageUrl: `${appUrl}/og-image.png`,
      noindex: true,
    },
  };

  return Response.json(manifest);
}
