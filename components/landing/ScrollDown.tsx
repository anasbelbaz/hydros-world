import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "motion/react";
import { DoubleArrowIcon } from "./DoubleArrowIcon";
import { useState } from "react";

export function ScrollDown() {
  const { scrollY } = useScroll();

  const [hasScrolled, setHasScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", scrollY =>
    setHasScrolled(scrollY > 100 ? true : false)
  );

  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-16">
      <motion.div
        className="flex flex-col items-center gap-2"
        animate={{
          y: hasScrolled ? 100 : 0,
          opacity: hasScrolled ? 0 : 1,
        }}
        transition={{ duration: 0.7, type: "spring" }}
      >
        <div className="uppercase text-green text-base font-herculanum">
          Scroll Down
        </div>

        <motion.div
          initial={{ y: "25%" }}
          animate={{ y: "0%" }}
          transition={{
            duration: 0.3,
            repeatDelay: 0.3,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        >
          <DoubleArrowIcon className="stroke-green size-6" />
        </motion.div>
      </motion.div>
    </div>
  );
}
