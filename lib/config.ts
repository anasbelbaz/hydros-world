import { defineChain } from "viem";
import { CONTRACT_ADDRESS } from "./env";

export const HYDROS_CONTRACT_ADDRESS = CONTRACT_ADDRESS as `0x${string}`;

export const hypeNetwork = defineChain({
  id: 998,
  name: "Hype Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "HYPE",
    symbol: "HYPE",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.hyperliquid-testnet.xyz/evm"],
    },
    public: {
      http: ["https://rpc.hyperliquid-testnet.xyz/evm"],
    },
  },
  blockExplorers: {
    default: {
      name: "HypeScan",
      url: "https://explorer.hyperliquid-testnet.xyz",
    },
  },
  testnet: true,
});
