import Image from "next/image";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

type NFT = {
  id: number;
  name: string;
  image: string;
  attributes: { trait_type: string; value: string }[];
};

type RevealDialogProps = {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  revealedNFTs: NFT[];
  currentNFT: NFT;
  setCurrentNFT: (nft: NFT) => void;
  navigateToPrev: () => void;
  navigateToNext: () => void;
  canNavigatePrev: () => boolean;
  canNavigateNext: () => boolean;
};

export default function RevealDialog({
  revealedNFTs,
  currentNFT,
  dialogOpen,
  setCurrentNFT,
  setDialogOpen,
  navigateToPrev,
  navigateToNext,
  canNavigatePrev,
  canNavigateNext,
}: RevealDialogProps) {
  // Check if there's only one NFT
  const isSingleNFT = revealedNFTs.length === 1;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent
        title="reveal hydros"
        className="backdrop-blur-md !border-none !bg-transparent justify-center max-w-[95vw] mx-auto sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[1100px] p-3 sm:p-4 md:p-6"
      >
        <div className="flex flex-col h-full w-full justify-center">
          <div className="flex-1 flex items-center justify-center">
            {/* Carousel implementation */}
            {revealedNFTs.length > 0 && (
              <div className="relative w-full flex flex-col gap-4">
                {/* Carousel Component */}
                <div className="flex flex-col md:flex-row items-center justify-center w-full gap-4">
                  {/* Previous button - only show if there are multiple NFTs */}
                  {!isSingleNFT && (
                    <Button
                      onClick={navigateToPrev}
                      disabled={!canNavigatePrev()}
                      className={`flex-shrink-0 w-13 h-10 rounded-full flex items-center justify-center order-1 
                      ${
                        canNavigatePrev()
                          ? "bg-[#98FCE433] hover:bg-[#98FCE433]/30 text-teal-50"
                          : "bg-gray-800/30 text-gray-400 cursor-not-allowed"
                      }`}
                      aria-label="Previous NFT"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </Button>
                  )}

                  <div
                    className={`flex flex-col md:flex-row items-center ${
                      isSingleNFT ? "w-full" : "w-full space-x-10"
                    } order-2`}
                  >
                    {/* NFT Image - Left Side (Top on mobile) */}
                    <div className="shadow-[0_0_100px_rgba(45,212,191,0.7)] w-full max-w-[350px] h-[350px] sm:w-[400px] sm:h-[400px] md:w-[350px] md:h-[350px] lg:w-[480px] lg:h-[480px] relative bg-gray-800/40 rounded-lg overflow-hidden order-1">
                      {currentNFT && (
                        <Image
                          src={currentNFT.image}
                          alt={currentNFT.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    {/* NFT Details - Right Side (Bottom on mobile) */}
                    <div className="w-full max-w-[350px] h-[350px] sm:w-[400px] sm:h-[400px] md:w-[350px] md:h-[350px] lg:w-[480px] lg:h-[480px] bg-[#FAFAFA0D] rounded-lg p-4 md:p-6 lg:p-8 flex flex-col mt-6 md:mt-0 order-2">
                      {currentNFT && (
                        <div className="flex flex-col text-center">
                          <div className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">
                            HYDROS #{currentNFT.id}
                          </div>
                          <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-herculanum mb-2 sm:mb-4 md:mb-6">
                            {currentNFT.name}
                          </h2>

                          {/* Rarity Badge */}
                          {currentNFT.attributes.find(
                            (attr) => attr.trait_type.toLowerCase() === "rarity"
                          ) && (
                            <div className="mb-2 sm:mb-4 md:mb-6">
                              <span className="inline-block px-2 py-1 sm:px-3 md:px-4 md:py-1 rounded-full bg-pink-600 text-white text-xs md:text-sm font-medium uppercase">
                                {
                                  currentNFT.attributes.find(
                                    (attr) =>
                                      attr.trait_type.toLowerCase() === "rarity"
                                  )?.value
                                }
                              </span>
                            </div>
                          )}

                          {/* Attributes List */}
                          <div className="flex-1 overflow-auto">
                            <div className="space-y-2 sm:space-y-3 md:space-y-4">
                              {currentNFT.attributes.map((attr, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between"
                                >
                                  <span className="text-gray-400 uppercase font-herculanum  md:text-base">
                                    {attr.trait_type}
                                  </span>
                                  <span className="text-teal-400 uppercase font-herculanum  md:text-base">
                                    {attr.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Next button - only show if there are multiple NFTs */}
                  {!isSingleNFT && (
                    <Button
                      onClick={navigateToNext}
                      disabled={!canNavigateNext()}
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center order-3 
                      ${
                        canNavigateNext()
                          ? "bg-[#98FCE433] hover:bg-[#98FCE433]/30 text-teal-50"
                          : "bg-gray-800/30 text-gray-400 cursor-not-allowed"
                      }`}
                      aria-label="Next NFT"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </Button>
                  )}
                </div>

                {/* Pagination Dots - only show if there are multiple NFTs */}
                {!isSingleNFT && (
                  <div className="flex justify-center gap-2 mt-4">
                    {revealedNFTs.map((nft, index) => (
                      <span
                        key={nft.id}
                        onClick={() => setCurrentNFT(revealedNFTs[index])}
                        className={`w-2 h-2 rounded-full ${
                          currentNFT?.id === nft.id
                            ? "bg-primary"
                            : "bg-primary/20"
                        }`}
                        aria-label={`Go to NFT ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* <div className="flex justify-center mt-4 md:mt-6">
          <Button
            onClick={() => setDialogOpen(false)}
            className="bg-teal-500/20 hover:bg-teal-500/30 text-teal-50 border border-teal-500/50 rounded-full px-6 py-2 md:px-8 md:py-2 font-herculanum text-sm md:text-base"
          >
            CLOSE
          </Button>
        </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
