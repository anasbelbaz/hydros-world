"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { hypeNetwork } from "./config";

// Create a QueryClient for data fetching/caching
const queryClient = new QueryClient();

interface Web3ProvidersProps {
  children: ReactNode;
}

export function Web3Providers({ children }: Web3ProvidersProps) {
  const [config] = useState(() =>
    createConfig({
      chains: [hypeNetwork],
      transports: {
        [hypeNetwork.id]: http(hypeNetwork.rpcUrls.default.http[0]),
      },
    })
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
