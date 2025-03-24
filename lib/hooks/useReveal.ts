"use client";

import { useWriteContract, useAccount, useWalletClient } from "wagmi";
import { HYDROS_CONTRACT_ADDRESS } from "../config";
import { Abi, encodePacked, keccak256, parseAbi } from "viem";
import { publicClient } from "../client";

// Define Reveal ABI
const HydrosNFTRevealABI = parseAbi([
  "function batchReveal(uint256[] calldata tokenIds, bytes32[] calldata userSalts) external",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function getUnrevealedTokens(address owner) external view returns (uint256[] memory)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function isTokenRevealed(uint256 tokenId) external view returns (bool)",
]) as Abi;

// Updated interface for reveal parameters to include salts
export interface RevealParams {
  tokenIds: number[];
  salts?: string[]; // Optional in the interface, but will be generated if not provided
  onSuccess?: (txHash: `0x${string}`) => void;
  onError?: (error: Error) => void;
}

export function useReveal() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Use writeContract hook (Wagmi v2)
  const { writeContractAsync, isPending, data: txHash } = useWriteContract();

  /**
   * Generate a random salt as bytes32
   * @returns A random bytes32 value as a string
   */
  const generateRandomSalt = (tokenId: number): string => {
    // Use a unique timestamp for all salts in the batch to ensure uniqueness
    const timestamp = Date.now();

    // Convert to hex string with 0x prefix (bytes32 format)
    return keccak256(
      encodePacked(
        ["address", "uint256", "uint256"],
        [address as `0x${string}`, BigInt(tokenId), BigInt(timestamp)]
      )
    );
  };

  /**
   * Execute batch reveal for multiple tokens with salts
   * @param tokenIds Array of token IDs to reveal
   * @param onSuccess Callback for successful transaction submission
   * @param onError Callback for errors
   * @returns Transaction hash
   */
  const executeReveal = async ({
    tokenIds,
    onSuccess,
    onError,
  }: RevealParams) => {
    try {
      if (!address) throw new Error("Wallet not connected");
      if (!tokenIds.length) throw new Error("No tokens selected for reveal");

      // Convert tokenIds array to BigInts
      const bigIntTokenIds = tokenIds.map((id) => BigInt(id));

      // Generate salts if not provided
      const userSalts = tokenIds.map((id) => generateRandomSalt(id));

      if (userSalts.length !== tokenIds.length) {
        throw new Error("Number of salts must match number of tokens");
      }

      console.log("Using salts for reveal:", userSalts);

      // Submit the transaction with both tokenIds and salts
      const tx = await writeContractAsync({
        address: HYDROS_CONTRACT_ADDRESS,
        abi: HydrosNFTRevealABI,
        functionName: "batchReveal",
        args: [bigIntTokenIds, userSalts],
        account: address,
        chain: walletClient?.chain,
      });

      console.log("Reveal transaction submitted:", tx);

      // Call success callback with transaction hash
      onSuccess?.(tx);

      return tx;
    } catch (error) {
      console.error("Reveal error:", error);

      if (error instanceof Error) {
        onError?.(error);
      } else {
        onError?.(new Error("Unknown error occurred during reveal"));
      }
    }
  };

  /**
   * Check if a user owns a specific token
   * This would be used to determine which tokens a user can reveal
   * In a real implementation, you might batch this or use a subgraph query
   */
  const checkTokenOwnership = async (tokenId: number) => {
    try {
      // This is a placeholder - in a real implementation you'd check if the
      // connected wallet owns the token by calling ownerOf
      console.log(`Checking ownership for token ${tokenId}`);

      // Example implementation (commented out)
      // const owner = await readContract({
      //   address: HYDROS_CONTRACT_ADDRESS,
      //   abi: HydrosNFTRevealABI,
      //   functionName: "ownerOf",
      //   args: [BigInt(tokenId)]
      // });
      // return owner === address;

      return true;
    } catch (error) {
      console.error("Error checking token ownership:", error);
      return false;
    }
  };

  /**
   * Get all unrevealed tokens owned by the current user
   * Calls the contract function to get unrevealed tokens
   */
  const getUnrevealedTokens = async (): Promise<number[]> => {
    try {
      if (!address) return [];

      // Call the contract function to get unrevealed tokens for the address
      const result = (await publicClient.readContract({
        address: HYDROS_CONTRACT_ADDRESS,
        abi: HydrosNFTRevealABI,
        functionName: "getUnrevealedTokens",
        args: [address],
      })) as bigint[];

      // Convert BigInt array to number array
      return result.map((id) => Number(id));
    } catch (error) {
      console.error("Error fetching unrevealed tokens:", error);
      return [];
    }
  };

  /**
   * Get token URI for a specific token ID
   * @param tokenId The ID of the token to get the URI for
   * @returns The token URI
   */
  const getTokenURI = async (tokenId: number): Promise<string> => {
    try {
      const uri = (await publicClient.readContract({
        address: HYDROS_CONTRACT_ADDRESS,
        abi: HydrosNFTRevealABI,
        functionName: "tokenURI",
        args: [BigInt(tokenId)],
      })) as string;

      return uri;
    } catch (error) {
      console.error(`Error fetching token URI for token ${tokenId}:`, error);
      throw error;
    }
  };

  /**
   * Check if a specific token is revealed
   * @param tokenId The ID of the token to check
   * @returns Boolean indicating if the token is revealed
   */
  const isTokenRevealed = async (tokenId: number): Promise<boolean> => {
    try {
      const revealed = (await publicClient.readContract({
        address: HYDROS_CONTRACT_ADDRESS,
        abi: HydrosNFTRevealABI,
        functionName: "isTokenRevealed",
        args: [BigInt(tokenId)],
      })) as boolean;

      return revealed;
    } catch (error) {
      console.error(`Error checking if token ${tokenId} is revealed:`, error);
      return false; // Default to false on error
    }
  };

  return {
    executeReveal,
    checkTokenOwnership,
    getUnrevealedTokens,
    getTokenURI,
    isTokenRevealed,
    isLoading: isPending,
    txHash,
  };
}
