"use client";

import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode, useEffect } from "react";
import { WagmiProvider } from "wagmi";
import { hypeNetwork } from "./config";
import { ENV } from "./env";
import { http } from "wagmi";

// Create a QueryClient for data fetching/caching
const queryClient = new QueryClient();

interface Web3ProvidersProps {
  children: ReactNode;
}

export function Web3Providers({ children }: Web3ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration errors by only mounting after client-side render
  useEffect(() => {
    setMounted(true);
  }, []);

  const [wagmiConfig] = useState(() =>
    getDefaultConfig({
      appName: "Hydros NFT",
      projectId: ENV.WALLET_CONNECT_PROJECT_ID,
      chains: [hypeNetwork],
      transports: {
        [hypeNetwork.id]: http(ENV.RPC_URL),
      },
      ssr: false,
    })
  );

  // Prevent hydration errors
  if (!mounted) return null;

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
