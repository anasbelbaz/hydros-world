/**
 * Environment variable utilities for Netlify functions
 * Based on: https://docs.netlify.com/functions/environment-variables/#access-environment-variables
 */

/**
 * Get an environment variable value
 * @param key The environment variable name
 * @param defaultValue Optional default value if the environment variable is not set
 * @returns The environment variable value or the default value
 */
export function getEnv(key: string, defaultValue: string = ""): string {
  return process.env[key] || defaultValue;
}

/**
 * Get an environment variable as a boolean
 * @param key The environment variable name
 * @param defaultValue Optional default value if the environment variable is not set
 * @returns The environment variable as a boolean or the default value
 */
export function getEnvBoolean(
  key: string,
  defaultValue: boolean = false
): boolean {
  const value = process.env[key];
  if (value === undefined || value === "") {
    return defaultValue;
  }
  return ["true", "1", "yes"].includes(value.toLowerCase());
}

/**
 * Get an environment variable as a number
 * @param key The environment variable name
 * @param defaultValue Optional default value if the environment variable is not set or not a valid number
 * @returns The environment variable as a number or the default value
 */
export function getEnvNumber(key: string, defaultValue: number = 0): number {
  const value = process.env[key];
  if (value === undefined || value === "") {
    return defaultValue;
  }
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get an environment variable as an array of strings
 * @param key The environment variable name
 * @param defaultValue Optional default value if the environment variable is not set
 * @param separator The separator to split the string by (default: comma)
 * @returns The environment variable as an array of strings or the default value
 */
export function getEnvArray(
  key: string,
  defaultValue: string[] = [],
  separator: string = ","
): string[] {
  const value = process.env[key];
  if (value === undefined || value === "") {
    return defaultValue;
  }
  return value.split(separator).map((item) => item.trim());
}

/**
 * Check if an environment variable is defined
 * @param key The environment variable name
 * @returns True if the environment variable is defined and not empty
 */
export function hasEnv(key: string): boolean {
  const value = process.env[key];
  return value !== undefined && value !== "";
}

// Specific environment variables from .env file
export const ENV = {
  // NFT related
  HYDROS_NFT_ADDRESS: getEnv(
    "NEXT_PUBLIC_HYDROS_NFT_ADDRESS",
    "0x8D49A5742584121ABBB7Ae3d50F79B10bB12f3D2"
  ),

  // Network related
  RPC_URL: getEnv(
    "NEXT_PUBLIC_RPC_URL",
    "https://rpc.hyperliquid-testnet.xyz/evm"
  ),
  EXPLORER_URL: getEnv(
    "NEXT_PUBLIC_EXPLORER_URL",
    "https://testnet.purrsec.com/tx/"
  ),
  CHAIN_ID: getEnvNumber("NEXT_PUBLIC_CHAIN_ID", 998),

  // WalletConnect
  WALLET_CONNECT_PROJECT_ID: getEnv(
    "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID",
    "a03353371f008832b7e0c8d3f508bd1c" // This is a placeholder - replace with your actual project ID
  ),

  // Access control
  WHITELIST_ADDRESSES: getEnvArray("NEXT_PUBLIC_WHITELIST_ADDRESSES", [
    "0x4cf877ACA8eD18372BB28791c0c69339c27F7d78",
    "0xfC08eCB5a9467a37329D4f5B515BDd4752A331cB",
    "0xD5de5a673C2FafeFbBE942B6A9Cbd30599D65Ec4",
  ]),
};

// Contract addresses
export const CONTRACT_ADDRESS = ENV.HYDROS_NFT_ADDRESS; // Replace with actual contract address

// Chain Configuration
export const CHAIN_ID = ENV.CHAIN_ID;
export const CHAIN_NAME = "Hype Testnet";
export const RPC_URL = ENV.RPC_URL;

// Environment settings
export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
