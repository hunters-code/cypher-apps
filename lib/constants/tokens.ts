export interface AvailableToken {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  logoURI?: string;
  tradable?: boolean;
  priceUSD?: number;
}

/** Icon path (under public) for each token used in Send UI */
export const TOKEN_ICONS: Record<string, string> = {
  ETH: "/assets/eth.png",
  CDT: "/assets/cdt.png",
} as const;

export interface SendTokenOption {
  symbol: "ETH" | "CDT";
  name: string;
  logoURI: string;
}

/** Token options for Send page (symbol, name, icon from constants) */
export const SEND_TOKEN_OPTIONS: SendTokenOption[] = [
  { symbol: "ETH", name: "Ethereum", logoURI: TOKEN_ICONS.ETH },
  { symbol: "CDT", name: "Cypher Dollar", logoURI: TOKEN_ICONS.CDT },
];

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
    logoURI: TOKEN_ICONS.CDT,
    tradable: false,
    priceUSD: 0,
  },
];
