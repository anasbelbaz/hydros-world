import { HypeLogo } from "@/lib/utils/utils";
import { formatUnits } from "viem";
import { motion } from "framer-motion";
import { useSaleInfoTestnet } from "@/lib/hooks/useSaleInfoTestnet";
import { EqualApproximately } from "lucide-react";

export function PriceTable() {
  const {
    data: saleInfo,
    isLoading,
    isError,
    // isRefetching,
  } = useSaleInfoTestnet();

  // Format duration from seconds to minutes
  const formatDuration = (durationInSeconds: bigint) => {
    return `${Math.ceil(Number(durationInSeconds) / 60)} MIN`;
  };

  // Format price to show only the significant digits
  const formatPrice = (price: bigint) => {
    return parseFloat(formatUnits(price, 18)).toFixed(4);
  };

  // Loading animation for value cells
  const LoadingValue = () => (
    <motion.div
      className="h-3 w-16 bg-primary/10 rounded ml-auto"
      animate={{
        opacity: [0.3, 0.6, 0.3],
        width: ["60%", "70%", "60%"],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );

  if (isError) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          className="price-table px-4 py-2 backdrop-blur-sm bg-[#0A1E23]/30 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-red-400 font-herculanum text-center">
            Error loading sale data
          </div>
        </motion.div>
        <motion.div
          className="price-table px-4 py-2 backdrop-blur-sm bg-[#0A1E23]/30 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="text-red-400 font-herculanum text-center">
            Error loading sale data
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Whitelist Price Table */}
      <motion.div
        className="price-table px-4 py-2 backdrop-blur-sm bg-[#0A1E23]/30 rounded-lg h-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-2 h-full grid-rows-4 auto-rows-fr">
          <div className="text-primary/80 font-herculanum text-sm uppercase self-center">
            WHITELIST PRICE
          </div>
          <div className="text-right text-white font-herculanum flex items-center justify-end self-center">
            {isLoading ? (
              <LoadingValue />
            ) : (
              <>
                <span>
                  {formatPrice(
                    saleInfo?.whitelistSaleConfig.price || BigInt(0)
                  )}
                </span>
                <HypeLogo className="ml-1 w-3 h-3" />
              </>
            )}
          </div>

          <div className="text-primary/80 font-herculanum text-sm uppercase self-center">
            MINT WINDOW
          </div>
          <div className="text-right text-white font-herculanum self-center">
            {isLoading ? (
              <LoadingValue />
            ) : (
              formatDuration(
                saleInfo?.whitelistSaleConfig.duration || BigInt(0)
              )
            )}
          </div>

          <div className="text-primary/80 font-herculanum text-sm uppercase self-center">
            ALLOCATION
          </div>
          <div className="text-right text-white font-herculanum self-center">
            {isLoading ? (
              <LoadingValue />
            ) : (
              `${
                saleInfo?.whitelistSaleConfig.maxPerWallet.toString() || "0"
              } / WALLET`
            )}
          </div>

          <div className="text-primary/80 font-herculanum text-sm uppercase self-center">
            TOTAL WL SUPPLY
          </div>
          <div className="text-right text-white font-herculanum self-center">
            {isLoading ? (
              <LoadingValue />
            ) : (
              saleInfo?.maxSupply.toString() || "0"
            )}
          </div>
        </div>
      </motion.div>

      {/* Auction Price Table */}
      <motion.div
        className="price-table px-4 py-2 backdrop-blur-sm bg-[#0A1E23]/30 rounded-lg h-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-2 h-full grid-rows-4 auto-rows-fr">
          <div className="text-primary/80 font-herculanum text-sm uppercase self-center">
            STARTING PRICE
          </div>
          <div className="text-right text-white font-herculanum flex items-center justify-end self-center">
            {isLoading ? (
              <LoadingValue />
            ) : (
              <>
                <span>
                  {formatPrice(saleInfo?.auctionSaleConfig.price || BigInt(0))}
                </span>
                <HypeLogo className="ml-1 w-3 h-3" />
              </>
            )}
          </div>

          <div className="text-primary/80 font-herculanum text-sm uppercase self-center">
            RESERVE PRICE
          </div>
          <div className="text-right text-white font-herculanum flex items-center justify-end self-center">
            {isLoading ? (
              <LoadingValue />
            ) : (
              <>
                <span>
                  {formatPrice(
                    saleInfo?.auctionSaleConfig.floorPrice || BigInt(0)
                  )}
                </span>
                <HypeLogo className="ml-1 w-3 h-3" />
              </>
            )}
          </div>

          <div className="text-primary/80 font-herculanum text-sm uppercase self-center">
            PRICE STEP
          </div>
          <div className="text-right text-white font-herculanum flex items-center justify-end self-center">
            {isLoading ? (
              <LoadingValue />
            ) : (
              <>
                <span className="flex items-center">
                  <EqualApproximately className="w-3 h-3" />
                  {`${parseFloat(
                    formatUnits(saleInfo?.priceStep || BigInt(0), 18)
                  ).toFixed(4)}`}
                </span>
                <HypeLogo className="ml-1 w-3 h-3" />
              </>
            )}
          </div>

          <div className="text-primary/80 font-herculanum text-sm uppercase self-center">
            STEP TIME
          </div>
          <div className="text-right text-white font-herculanum self-center">
            {isLoading ? (
              <LoadingValue />
            ) : (
              formatDuration(saleInfo?.priceUpdateInterval || BigInt(0))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
