"use client";

import { useQuery } from "@tanstack/react-query";
import { Abi, parseAbi } from "viem";
import { useAccount } from "wagmi";

import { SalesInfo, SalePhase } from "../abi/types";
import { HYDROS_CONTRACT_ADDRESS } from "../config";
import { publicClient } from "../client";

// Define ABI instead of importing JSON to ensure proper TypeScript typing
const HydrosNFTSaleABI = parseAbi([
  "function getCurrentPhase() view returns (uint8)",
  "function whitelistSaleConfig() view returns (uint256 price, uint256 startTime, uint256 duration, uint256 maxPerWallet, uint256 maxSupply)",
  "function auctionSaleConfig() view returns (uint256 price, uint256 floorPrice, uint256 startTime, uint256 duration, uint256 maxPerWallet, uint256 priceUpdateInterval)",
  "function MAX_SUPPLY() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function transfersEnabled() view returns (bool)",
  "function revealEnabled() view returns (bool)",
  "function getCurrentPrice() view returns (uint256)",
  "function getUnrevealedTokens(address owner) external view returns (uint256[] memory)",
]) as Abi;

// Extended SalesInfo interface to include price step
export interface ExtendedSalesInfo extends SalesInfo {
  priceStep: bigint;
  currentPrice: bigint;
  priceUpdateInterval: bigint;
  auctionEndTime: bigint;
  isAuctionEnded: boolean;
  unrevealedTokens: bigint[]; // Array of unrevealed token IDs
}

export function useSaleInfoTestnet() {
  const { address } = useAccount();

  return useQuery({
    queryKey: ["saleInfoTestnet", address],
    queryFn: async (): Promise<ExtendedSalesInfo | undefined> => {
      try {
        // Make individual contract calls instead of using multicall
        // 1. Get current phase
        const currentPhaseResult = await publicClient.readContract({
          address: HYDROS_CONTRACT_ADDRESS,
          abi: HydrosNFTSaleABI,
          functionName: "getCurrentPhase",
        });

        console.log("currentPhaseResult", currentPhaseResult);

        const getUnrevealedTokensResult = address
          ? ((await publicClient.readContract({
              address: HYDROS_CONTRACT_ADDRESS,
              abi: HydrosNFTSaleABI,
              functionName: "getUnrevealedTokens",
              args: [address],
            })) as bigint[])
          : [];

        // 2. Get whitelist sale config
        const whitelistSaleConfigResult = await publicClient.readContract({
          address: HYDROS_CONTRACT_ADDRESS,
          abi: HydrosNFTSaleABI,
          functionName: "whitelistSaleConfig",
        });

        console.log("whitelistSaleConfigResult", whitelistSaleConfigResult);

        // 3. Get auction sale config
        const auctionSaleConfigResult = await publicClient.readContract({
          address: HYDROS_CONTRACT_ADDRESS,
          abi: HydrosNFTSaleABI,
          functionName: "auctionSaleConfig",
        });

        console.log("auctionSaleConfigResult", auctionSaleConfigResult);

        // 4. Get max supply
        const maxSupplyResult = await publicClient.readContract({
          address: HYDROS_CONTRACT_ADDRESS,
          abi: HydrosNFTSaleABI,
          functionName: "MAX_SUPPLY",
        });

        // 5. Get total supply
        const totalSupplyResult = await publicClient.readContract({
          address: HYDROS_CONTRACT_ADDRESS,
          abi: HydrosNFTSaleABI,
          functionName: "totalSupply",
        });

        // 6. Get transfers enabled
        const transfersEnabledResult = await publicClient.readContract({
          address: HYDROS_CONTRACT_ADDRESS,
          abi: HydrosNFTSaleABI,
          functionName: "transfersEnabled",
        });

        // 7. Get reveal enabled
        const revealEnabledResult = await publicClient.readContract({
          address: HYDROS_CONTRACT_ADDRESS,
          abi: HydrosNFTSaleABI,
          functionName: "revealEnabled",
        });

        // 8. Get current price
        const currentPriceResult = await publicClient.readContract({
          address: HYDROS_CONTRACT_ADDRESS,
          abi: HydrosNFTSaleABI,
          functionName: "getCurrentPrice",
        });

        // Cast the phase to SalePhase type
        const phase = Number(currentPhaseResult) as SalePhase;
        const unrevealedTokens = getUnrevealedTokensResult as bigint[];

        // Safe type assertion for the structured returns
        const wlConfig = whitelistSaleConfigResult as unknown as [
          bigint,
          bigint,
          bigint,
          bigint,
          bigint
        ];

        const auctionConfig = auctionSaleConfigResult as unknown as [
          bigint,
          bigint,
          bigint,
          bigint,
          bigint,
          bigint
        ];

        // Calculate the price step based on the auction config and price update interval
        // From the contract: price decreases linearly over time
        const startPrice = auctionConfig[0];
        const duration = auctionConfig[2];
        const priceUpdateInterval = auctionConfig[5] as bigint;
        const auctionEndTime = auctionConfig[2] + auctionConfig[3];

        // Calculate number of intervals in the auction duration
        const numIntervals = duration / priceUpdateInterval;

        // Price step is the amount price decreases per interval
        // Calculated as total price range divided by number of intervals
        const priceStep =
          numIntervals > 0 ? startPrice / numIntervals : BigInt(0);

        const isAuctionEnded =
          new Date(Number(auctionEndTime) * 1000) < new Date();

        return {
          currentPhase: phase,
          whitelistSaleConfig: {
            price: wlConfig[0],
            startTime: wlConfig[1],
            duration: wlConfig[2],
            maxPerWallet: wlConfig[3],
            maxSupply: wlConfig[4],
          },
          auctionSaleConfig: {
            price: auctionConfig[0],
            floorPrice: auctionConfig[1],
            startTime: auctionConfig[2],
            duration: auctionConfig[3],
            maxPerWallet: auctionConfig[4],
          },
          isAuctionEnded,
          auctionEndTime: auctionEndTime,
          maxSupply: maxSupplyResult as bigint,
          totalSupply: totalSupplyResult as bigint,
          transfersEnabled: Boolean(transfersEnabledResult),
          revealEnabled: Boolean(revealEnabledResult),
          // Additional fields
          priceStep: priceStep,
          currentPrice: currentPriceResult as bigint,
          priceUpdateInterval: priceUpdateInterval,
          unrevealedTokens,
        };
      } catch (error) {
        console.error("Error fetching sale info from testnet:", error);
        throw error;
      }
    },
    // Refresh every 30 seconds
    // refetchInterval: 30000,
  });
}
