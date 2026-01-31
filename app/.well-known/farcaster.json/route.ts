export async function GET() {
  const appUrl =
    process.env.NEXT_PUBLIC_URL || "https://cypher-apps.vercel.app";

  const manifest = {
    accountAssociation: {
      header:
        "eyJmaWQiOjE2MDEzMjQsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhGY2ZlMDdhMUIzMWE2RDZFMzM1ZjFGNWZmODgzM2YzYjQzM2FEZjk4In0",
      payload: "eyJkb21haW4iOiJjeXBoZXItYXBwcy52ZXJjZWwuYXBwIn0",
      signature:
        "uXgQOgPEEH0HAqi5/KyLUGdSjOvyq97QyJyZRLJx9M5vDxhWWGhBU+npukikqnXHlhin/lM8ckr4WKeZuHJuNxs=",
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
      noindex: false,
    },
  };

  return Response.json(manifest, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
