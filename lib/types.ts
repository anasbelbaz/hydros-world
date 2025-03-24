export interface NFTMetadata {
  id: number;
  name: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
}
