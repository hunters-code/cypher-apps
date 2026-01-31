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
      iconUrl:
        "https://raw.githubusercontent.com/hunters-code/cypher-apps/refs/heads/main/previews/Cypher-Logo.jpg",
      splashImageUrl:
        "https://raw.githubusercontent.com/hunters-code/cypher-apps/refs/heads/main/previews/Cypher-Logo.jpg",
      splashBackgroundColor: "#000000",
      webhookUrl: `${appUrl}/api/webhook`,
      subtitle: "Private crypto wallet",
      description:
        "Your crypto, truly private. Enjoy cash-level privacy on the blockchain.",
      screenshotUrls: [
        "https://raw.githubusercontent.com/hunters-code/cypher-apps/refs/heads/main/previews/Cypher-Preview-1.jpg",
        "https://raw.githubusercontent.com/hunters-code/cypher-apps/refs/heads/main/previews/Cypher-Preview-2.jpg",
      ],
      primaryCategory: "finance",
      tags: ["crypto", "wallet", "privacy", "baseapp"],
      heroImageUrl:
        "https://raw.githubusercontent.com/hunters-code/cypher-apps/refs/heads/main/previews/Cypher-Hero-Image.jpg",
      tagline: "Your crypto, truly private",
      ogTitle: "Cypher Wallet",
      ogDescription:
        "Your crypto, truly private. Enjoy cash-level privacy on the blockchain.",
      ogImageUrl:
        "https://raw.githubusercontent.com/hunters-code/cypher-apps/refs/heads/main/previews/Cypher-Hero-Image.jpg",
      noindex: true,
    },
  };

  return Response.json(manifest, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
