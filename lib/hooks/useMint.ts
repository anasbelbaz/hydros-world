"use client";

import { useWalletClient, useWriteContract } from "wagmi";
import { HYDROS_CONTRACT_ADDRESS } from "../config";
import { PHASE_WHITELIST, PHASE_AUCTION } from "../abi/types";
import { Abi, parseAbi } from "viem";
import { useSaleInfoTestnet } from "./useSaleInfoTestnet";

// Define contract ABI
const HydrosNFTSaleABI = parseAbi([
  "function whitelistMint(uint256 quantity, bytes32[] calldata merkleProof) external payable",
  "function auctionMint(uint256 quantity) external payable",
  "function getCurrentPrice() view returns (uint256)",
]) as Abi;

// Simple interface for mint parameters
export interface MintParams {
  quantity: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useMint() {
  const { data: saleInfo } = useSaleInfoTestnet();
  const { data: waleltClient } = useWalletClient();

  // Use writeContract hook (Wagmi v2)
  const { writeContractAsync, isPending } = useWriteContract();

  // Calculate the amount to send based on quantity and price
  const calculateMintValue = (quantity: number) => {
    if (!saleInfo) return BigInt(0);

    const unitPrice =
      saleInfo.currentPhase === PHASE_WHITELIST
        ? saleInfo.whitelistSaleConfig.price
        : saleInfo.auctionSaleConfig.price;

    return unitPrice * BigInt(quantity);
  };

  // Execute the mint based on the current phase
  const executeMint = async ({ quantity, onSuccess, onError }: MintParams) => {
    try {
      if (!saleInfo) throw new Error("Sale info not available");

      const value = calculateMintValue(quantity);
      let tx;
      if (saleInfo.currentPhase === PHASE_WHITELIST) {
        // For whitelist phase, we need a merkle proof
        // In a real implementation, you would fetch this from backend
        const merkleProof: `0x${string}`[] = [];

        tx = await writeContractAsync({
          address: HYDROS_CONTRACT_ADDRESS,
          abi: HydrosNFTSaleABI,
          functionName: "whitelistMint",
          args: [BigInt(quantity), merkleProof],
          value,
          chain: waleltClient.chain,
          account: waleltClient.account,
        });
      } else if (saleInfo.currentPhase === PHASE_AUCTION) {
        tx = await writeContractAsync({
          address: HYDROS_CONTRACT_ADDRESS,
          abi: HydrosNFTSaleABI,
          functionName: "auctionMint",
          args: [BigInt(quantity)],
          value,
          chain: waleltClient.chain,
          account: waleltClient.account,
        });
      } else {
        throw new Error("Minting not available in current phase");
      }

      onSuccess?.();
      return tx;
    } catch (error) {
      console.error("Mint error:", error);
      if (error instanceof Error) {
        onError?.(error);
      } else {
        onError?.(new Error("Unknown error occurred"));
      }
    }
  };

  return {
    executeMint,
    isLoading: isPending,
    currentPhase: saleInfo?.currentPhase,
  };
}
