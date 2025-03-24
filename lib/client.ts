import { createPublicClient, http } from "viem";
import { hypeNetwork } from "./config";

// Create a public client without requiring signing capabilities
export const publicClient = createPublicClient({
  chain: hypeNetwork,
  transport: http(hypeNetwork.rpcUrls.default.http[0]),
});
