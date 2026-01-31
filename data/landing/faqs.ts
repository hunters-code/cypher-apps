import type { LandingFaq } from "@/types/landing";

export const landingFaqs: LandingFaq[] = [
  {
    question: "What is Cypher?",
    answer:
      "Cypher is a privacy-focused crypto wallet that uses stealth addresses so you can send to usernames without exposing your transaction history or balance on the blockchain.",
  },
  {
    question: "Do I need to understand stealth addresses?",
    answer:
      "No. You just pick a username and send or receive like a normal wallet. Stealth addresses and announcements are handled for you on-chain.",
  },
  {
    question: "Is my balance really private?",
    answer:
      "Yes. Balances and history are derived from stealth metadata and your keys, not from public addresses. Only you see your full picture.",
  },
  {
    question: "Can I recover my wallet?",
    answer:
      "Yes. Cypher supports recovery flows so you can regain access using your chosen method while keeping privacy intact.",
  },
  {
    question: "Which chain does Cypher use?",
    answer:
      "Cypher runs on Base (and Base Sepolia for testing), using stealth announcement and registry contracts for private transfers.",
  },
];
