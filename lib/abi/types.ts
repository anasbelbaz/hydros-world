// Sale phases
export const PHASE_INACTIVE = 0;
export const PHASE_WHITELIST = 1;
export const PHASE_AUCTION = 2;
export const PHASE_FINISHED = 3;

export type SalePhase =
  | typeof PHASE_INACTIVE
  | typeof PHASE_WHITELIST
  | typeof PHASE_AUCTION
  | typeof PHASE_FINISHED;

// Sale config
export interface SaleConfig {
  price: bigint;
  startTime: bigint;
  duration: bigint;
  maxPerWallet: bigint;
}

export interface WhitelistConfig extends SaleConfig {
  maxSupply: bigint;
}

export interface AuctionConfig extends SaleConfig {
  floorPrice: bigint;
}

// NFT Metadata
export interface NFTMetadata {
  tokenId: number;
  isRevealed: boolean;
  revealedId?: number;
}

// Sales info
export interface SalesInfo {
  currentPhase: SalePhase;
  whitelistSaleConfig: WhitelistConfig;
  auctionSaleConfig: AuctionConfig;
  maxSupply: bigint;
  totalSupply: bigint;
  transfersEnabled: boolean;
  revealEnabled: boolean;
}
