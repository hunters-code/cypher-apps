export interface AvailableToken {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  logoURI?: string;
  tradable?: boolean;
  priceUSD?: number;
}

export const AVAILABLE_TOKENS: AvailableToken[] = [
  {
    name: "Ethereum Testnet",
    symbol: "ETH",
    address: "native",
    decimals: 18,
    logoURI: undefined,
    tradable: true,
  },
  {
    name: "Cypher Demo Token",
    symbol: "CDT",
    address: "0xF80eE164f12a6FdB48c0E58e321d100CdDA508bC",
    decimals: 18,
    logoURI: undefined,
    tradable: false,
    priceUSD: 0,
  },
];
