import Image from "next/image";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

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
  const [fadeClass, setFadeClass] = useState("");

  const handleNavigate = (direction: "prev" | "next") => {
    setFadeClass("slider-fade-out");
  
    setTimeout(() => {
      if (direction === "prev") {
        navigateToPrev();
      } else {
        navigateToNext();
      }
      setFadeClass("slider-fade-in");
    }, 600);
  };

  const rarityStyles: Record<string, string> = {
    common: "bg-[#98FCE4] text-black",
    rare: "bg-[#6CC50C] text-white",
    legendary: "bg-gradient-to-r from-[#FCC400] to-[#CC7C09] text-black",
    mythic: "bg-gradient-to-r from-[#E4205E] to-[#E420AB] text-black",
  };

  const rarityColors: Record<string, string> = {
    common: "#98FCE4",
    rare: "#6CC50C",
    legendary: "#FFB323",
    mythic: "#E4205B",
  };

  const rarityAttribute = currentNFT.attributes.find(
    (attr) => attr.trait_type.toLowerCase() === "rarity"
  );
  const rarityValue = rarityAttribute ? rarityAttribute.value.toLowerCase() : "common";
  const rarityClass = rarityStyles[rarityValue] || rarityStyles["common"];
  const rarityColor = rarityColors[rarityValue] || rarityColors["common"];

  const imageRef = useRef<HTMLDivElement | null>(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const targetX = useRef(0);
  const targetY = useRef(0);
  const animatedX = useRef(0);
  const animatedY = useRef(0);
  const rafId = useRef(0);

  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  useEffect(() => {
    if (!dialogOpen) {
      setIsMounted(false);
      return;
    }

    // On attend que le DOM soit complètement mis à jour
    const observer = new MutationObserver(() => {
      if (imageRef.current) {
        setIsMounted(true);
        observer.disconnect(); // On arrête d'observer une fois que l'élément est monté
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [dialogOpen]);

  useEffect(() => {
    if (!isMounted || !imageRef.current) return;
  
    const handleMouseMove = (e: MouseEvent) => {
      const rect = imageRef.current!.getBoundingClientRect();
      targetX.current = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      targetY.current = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
    };
  
    const handleMouseLeave = () => {
      targetX.current = 0;
      targetY.current = 0;
    };
  
    const element = imageRef.current;
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);
  
    const animate = () => {
      animatedX.current = lerp(animatedX.current, targetX.current, 0.2);
      animatedY.current = lerp(animatedY.current, targetY.current, 0.2);
      setMouseX(animatedX.current);
      setMouseY(animatedY.current);
      rafId.current = requestAnimationFrame(animate);
    };
  
    rafId.current = requestAnimationFrame(animate);
  
    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafId.current);
    };
  }, [isMounted]);

  const attributeVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1 + 0.3,
        type: "spring",
        stiffness: 200,
        damping: 15,
        mass: 1,
      },
    }),
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent
        title="reveal hydros"
        className="!border-none !bg-transparent !shadow-none z-20 justify-around h-[85vh] !max-w-[100vw] w-[96vw] lg:w-[80vw] inset-0 translate-x-0 translate-y-0 m-auto p-0"
      >
        <div className="flex flex-col h-full w-[96vw] lg:w-[80vw] justify-around mt-[3vh] xl:mt-[6vh]">
          <div className="flex-1 flex items-center justify-around">
            {/* Carousel implementation */}
            {revealedNFTs.length > 0 && (
              <div className={`relative w-full flex-1 h-full justify-around flex flex-col gap-4`}>
                {/* Carousel Component */}
                <div className="flex items-center justify-center w-full gap-4">
                  {/* Previous button - only show if there are multiple NFTs */}
                  {!isSingleNFT && (
                    <Button
                      onClick={() => handleNavigate("prev")}
                      disabled={!canNavigatePrev()}
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center order-1 
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
                    className={`max-w-7xl mx-auto flex flex-col md:flex-row justify-center items-center md:gap-10 gap-[4vh] ${
                      isSingleNFT ? "w-full" : "w-full"
                    } order-2 slider ${fadeClass}`}
                  >
                    {/* NFT Image - Left Side (Top on mobile) */}
                    <div className="aspect-square w-full max-w-[30vh] md:max-w-[65vh] relative  order-1">
                      <motion.div
                              initial={{ backgroundColor: `${rarityColor}00` }}
                              animate={{ backgroundColor: `${rarityColor}44` }}
                              transition={{ duration: 0.6, ease: "easeInOut", delay: 0.2 }}
                              className="absolute w-full h-full rounded-2xl blur-3xl overflow-hidden scale-[1.15]"
                            >
                      </motion.div>
                      <motion.div 
                        className="w-full h-full" 
                        ref={imageRef} 
                        style={{ perspective: "800px", transformStyle: "preserve-3d"  }}
                        whileHover={{
                          scale: 1.04,
                        }}
                        transition={{ type: "spring", stiffness: 350, damping: 15 }}
                      >
                        <motion.div
                          className="w-full h-full"
                          animate={{
                            rotateX: mouseY,
                            rotateY: -mouseX,
                          }}
                          transition={{ type: "tween", duration: 0, ease: "easeOut" }}
                        >
                          {currentNFT && (   
                            <Image
                              src={currentNFT.image}
                              alt={currentNFT.name}
                              fill
                              className="image-slider object-cover rounded-lg"
                            />
                          )}
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* NFT Details - Right Side (Bottom on mobile) */}
                    <motion.div 
                      key={currentNFT.id}
                      initial="hidden"
                      animate="visible"
                      className="content-slider md:aspect-square w-full max-w-[80vw] md:max-w-[65vh] bg-[#FAFAFA0D] rounded-lg flex flex-col justify-center order-2"
                    >
                      {currentNFT && (
                        <div className="flex flex-col text-center max-w-[400px] w-full mx-auto lg:gap-[5vh] md:gap-[4vh] gap-[3vh] px-[4vw] py-4 md:py-6 lg:py-8">
                          <div>
                            <motion.div
                              variants={{
                                hidden: { opacity: 0, y: 10 },
                                visible: { 
                                  opacity: 1, 
                                  y: 0, 
                                  transition: {
                                    delay: 0,
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 15,
                                    mass: 1 
                                  }
                                }
                              }}
                            >
                              <p className="text-gray-400 text-xs sm:text-sm font-herculanum">
                                HYDROS #{currentNFT.id}
                              </p>
                            </motion.div>
                            <motion.div
                              variants={{
                                hidden: { opacity: 0, y: 10 },
                                visible: { 
                                  opacity: 1, 
                                  y: 0, 
                                  transition: {
                                    delay: 0.1,
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 15,
                                    mass: 1 
                                  }
                                }
                              }}
                            >
                              <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-herculanum">
                                {currentNFT.name}
                              </h2>
                            </motion.div>
                          </div>

                          {/* Rarity Badge */}
                          {currentNFT.attributes.find(
                            (attr) => attr.trait_type.toLowerCase() === "rarity"
                          ) && (
                            <motion.div 
                              className="mb-[3vh]"
                              variants={{
                                hidden: { opacity: 0, y: 10 },
                                visible: { 
                                  opacity: 1, 
                                  y: 0, 
                                  transition: {
                                    delay: 0.2,
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 15,
                                    mass: 1 
                                  }
                                }
                              }}
                            >
                              <span className={`inline-block px-2 py-1 sm:px-3 md:px-4 md:py-1 rounded-full font-herculanum text-xs md:text-sm font-medium uppercase ${rarityClass}`}>
                                {
                                  currentNFT.attributes.find(
                                    (attr) =>
                                      attr.trait_type.toLowerCase() === "rarity"
                                  )?.value
                                }
                              </span>
                            </motion.div>
                          )}

                          {/* Attributes List */}
                          <div className="flex-1 overflow-hidden">
                              {currentNFT.attributes.map((attr, index) => (
                                <motion.div
                                  key={index}
                                  className="flex justify-between"
                                  custom={index}
                                  variants={attributeVariants}
                                >
                                  <span className="text-gray-400 w-2/5 text-left uppercase font-herculanum  md:text-base">
                                    {attr.trait_type}
                                  </span>
                                  <span className="uppercase flex-1 text-left font-herculanum  md:text-base" style={{color: `${rarityColor}`}}>
                                    {attr.value}
                                  </span>
                                </motion.div>
                              ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Next button - only show if there are multiple NFTs */}
                  {!isSingleNFT && (
                    <Button
                      onClick={() => handleNavigate("next")}
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
