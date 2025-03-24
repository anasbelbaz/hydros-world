"use client";
//@ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { SalesInfo, SalePhase } from "../abi/types";
import { HYDROS_CONTRACT_ADDRESS } from "../config";
import { publicClient } from "../client";
import { Abi, Client, MulticallResults, parseAbi } from "viem";
import { multicall } from "viem/actions";
import { useAccount } from "wagmi";

// Define ABI instead of importing JSON to ensure proper TypeScript typing
const HydrosNFTSaleABI = parseAbi([
  "function storedPhase() view returns (uint8)",
  "function whitelistSaleConfig() view returns (uint256 price, uint256 startTime, uint256 duration, uint256 maxPerWallet)",
  "function auctionSaleConfig() view returns (uint256 price, uint256 startTime, uint256 duration, uint256 maxPerWallet)",
  "function MAX_SUPPLY() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function transfersEnabled() view returns (bool)",
  "function revealEnabled() view returns (bool)",
]) as Abi;

export function useSaleInfo() {
  const { address } = useAccount();
  return useQuery({
    queryKey: ["saleInfo", address],
    queryFn: async (): Promise<SalesInfo> => {
      try {
        // Use multicall to batch all contract reads into a single request

        const [
          currentPhase,
          whitelistSaleConfig,
          auctionSaleConfig,
          maxSupply,
          totalSupply,
          transfersEnabled,
          revealEnabled,
        ] = (await multicall(publicClient as Client, {
          contracts: [
            {
              address: HYDROS_CONTRACT_ADDRESS,
              abi: HydrosNFTSaleABI,
              functionName: "storedPhase",
            },
            {
              address: HYDROS_CONTRACT_ADDRESS,
              abi: HydrosNFTSaleABI,
              functionName: "whitelistSaleConfig",
            },
            {
              address: HYDROS_CONTRACT_ADDRESS,
              abi: HydrosNFTSaleABI,
              functionName: "auctionSaleConfig",
            },
            {
              address: HYDROS_CONTRACT_ADDRESS,
              abi: HydrosNFTSaleABI,
              functionName: "MAX_SUPPLY",
            },
            {
              address: HYDROS_CONTRACT_ADDRESS,
              abi: HydrosNFTSaleABI,
              functionName: "totalSupply",
            },
            {
              address: HYDROS_CONTRACT_ADDRESS,
              abi: HydrosNFTSaleABI,
              functionName: "transfersEnabled",
            },
            {
              address: HYDROS_CONTRACT_ADDRESS,
              abi: HydrosNFTSaleABI,
              functionName: "revealEnabled",
            },
          ],
        })) as MulticallResults;

        // Cast the phase to SalePhase type
        const phase = Number(currentPhase.result) as SalePhase;

        // Safe type assertion for the structured returns
        const wlConfig = whitelistSaleConfig.result as unknown as [
          bigint,
          bigint,
          bigint,
          bigint
        ];
        const auctionConfig = auctionSaleConfig.result as unknown as [
          bigint,
          bigint,
          bigint,
          bigint,
          bigint
        ];

        return {
          currentPhase: phase,
          whitelistSaleConfig: {
            price: wlConfig[0],
            startTime: wlConfig[1],
            duration: wlConfig[2],
            maxPerWallet: wlConfig[3],
            maxSupply: maxSupply.result as bigint,
          },
          auctionSaleConfig: {
            price: auctionConfig[0],
            startTime: auctionConfig[1],
            duration: auctionConfig[2],
            maxPerWallet: auctionConfig[3],
            floorPrice: auctionConfig[4],
          },
          maxSupply: maxSupply.result as bigint,
          totalSupply: totalSupply.result as bigint,
          transfersEnabled: Boolean(transfersEnabled.result),
          revealEnabled: Boolean(revealEnabled.result),
        };
      } catch (error) {
        console.error("Error fetching sale info:", error);
        throw error;
      }
    },
    // Refresh every 30 seconds
    refetchInterval: 30000,
  });
}
