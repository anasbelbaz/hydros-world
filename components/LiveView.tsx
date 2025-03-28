import { useState, useEffect } from "react";
import { PHASE_AUCTION, PHASE_WHITELIST } from "@/lib/abi/types";
import { useSaleInfoTestnet } from "@/lib/hooks/useSaleInfoTestnet";
import { Users } from "lucide-react";

export default function LiveView() {
  const { data: saleInfo } = useSaleInfoTestnet();
  const [viewers, setViewers] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  useEffect(() => {
    // Initial calculation of viewers
    calculateViewers();

    // Update viewers every 3-10 seconds to simulate fluctuation
    const interval = setInterval(() => {
      calculateViewers();
      setLastUpdated(Date.now());
    }, Math.random() * 7000 + 3000);

    return () => clearInterval(interval);
  }, [saleInfo]);

  const calculateViewers = () => {
    if (!saleInfo) {
      setViewers(0);
      return;
    }

    const now = Math.floor(Date.now() / 1000);

    // Case 1: 30 minutes before whitelist until whitelist starts
    // Viewers increase from 200 to 1500
    if (saleInfo.currentPhase === PHASE_WHITELIST) {
      const whitelistStartTime = Number(saleInfo.whitelistSaleConfig.startTime);
      const auctionStartTime = Number(saleInfo.auctionSaleConfig.startTime);
      const thirtyMinBeforeWL = whitelistStartTime - 30 * 60;

      if (now >= thirtyMinBeforeWL && now < auctionStartTime) {
        // Calculate how far we are in this phase (0-1)
        const totalDuration = auctionStartTime - thirtyMinBeforeWL;
        const elapsed = now - thirtyMinBeforeWL;
        const progress = Math.min(1, Math.max(0, elapsed / totalDuration));

        // Interpolate from 200 to 1500 viewers
        const baseViewers = Math.round(200 + 1300 * progress);

        // Add some randomness for realism (±5%)
        const randomFactor = 0.95 + Math.random() * 0.1;
        setViewers(Math.round(baseViewers * randomFactor));
        return;
      }
    }

    // Case 2: During auction first hours - around 1500-2000 viewers
    if (saleInfo.currentPhase === PHASE_AUCTION) {
      const auctionStartTime = Number(saleInfo.auctionSaleConfig.startTime);
      const auctionDuration = Number(saleInfo.auctionSaleConfig.duration);
      const auctionEndTime = auctionStartTime + auctionDuration;

      // First 4 hours of auction: viewers decrease from 2000 to 1000
      const fourHoursAfterStart = auctionStartTime + 4 * 60 * 60;

      if (now >= auctionStartTime && now < fourHoursAfterStart) {
        // Calculate progress through the first 4 hours
        const totalDuration = fourHoursAfterStart - auctionStartTime;
        const elapsed = now - auctionStartTime;
        const progress = Math.min(1, Math.max(0, elapsed / totalDuration));

        // Interpolate from 2000 to 1000 viewers
        const baseViewers = Math.round(2000 - 1000 * progress);

        // Add some randomness for realism (±10%)
        const randomFactor = 0.9 + Math.random() * 0.2;
        setViewers(Math.round(baseViewers * randomFactor));
        return;
      }

      // Remaining auction time: gradually decrease and stabilize at 300-400 viewers
      if (now >= fourHoursAfterStart && now < auctionEndTime) {
        // Calculate progress through the remaining auction time
        const remainingDuration = auctionEndTime - fourHoursAfterStart;
        const elapsed = now - fourHoursAfterStart;
        const progress = Math.min(1, Math.max(0, elapsed / remainingDuration));

        // Start at 1000 and decrease to 350 (stabilizing point)
        const baseViewers = Math.round(1000 - 650 * Math.min(1, progress * 2));

        // Add some randomness for realism (±15%)
        const randomFactor = 0.85 + Math.random() * 0.3;
        setViewers(Math.round(baseViewers * randomFactor));
        return;
      }
    }

    // Default case (e.g., before whitelist or after auction)
    // Just show some random viewer count between 50-150
    setViewers(Math.round(50 + Math.random() * 100));
  };

  // Don't show viewer count if there's no sale info yet
  if (!saleInfo) {
    return null;
  }

  // Animation for viewer count changing
  const isIncreasing = viewers > 0 && Date.now() - lastUpdated < 1000;

  return (
    <div className="w-full mt-6 mb-4">
      <div className="flex items-center justify-center gap-2 py-2 px-4 backdrop-blur-sm bg-white/5 rounded-full mx-auto w-fit">
        <div
          className={`flex items-center gap-2 text-sm text-gray-200 font-medium ${
            isIncreasing ? "text-primary" : ""
          }`}
        >
          <Users className="w-4 h-4 text-primary animate-pulse" />
          <span className="transition-all duration-300 font-herculanum">
            {viewers.toLocaleString()}
          </span>
          <span className="text-xs text-gray-400 font-herculanum">viewers</span>
        </div>
      </div>
    </div>
  );
}
