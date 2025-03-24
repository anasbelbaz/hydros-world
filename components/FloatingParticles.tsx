import { motion } from "framer-motion";

export function FloatingParticles() {
  if (typeof window === "undefined") return null;

  return (
    <motion.div className="fixed inset-0 w-screen h-screen z-0 overflow-hidden pointer-events-none">
      <div className="h-full w-full relative">
        {/* Background particles */}
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={`bg-${i}`}
            className="absolute w-1.5 h-1.5 bg-teal-200/40 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5 + 0.1,
            }}
            animate={{
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
              ],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Larger, slower particles */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`lg-${i}`}
            className="absolute w-2.5 h-2.5 bg-teal-300/30 rounded-full blur-[1px]"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.4 + 0.1,
            }}
            animate={{
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
              ],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 8 + Math.random() * 15,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
