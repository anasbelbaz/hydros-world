import { motion } from "framer-motion";

export function PriceTablesLoading() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <motion.div
        className="price-table p-6 backdrop-blur-sm bg-[#0A1E23]/30 border border-primary/20 rounded-lg overflow-hidden h-full"
        initial={{ opacity: 0.5 }}
        animate={{
          opacity: [0.5, 0.7, 0.5],
          borderColor: [
            "rgba(152, 252, 228, 0.1)",
            "rgba(152, 252, 228, 0.3)",
            "rgba(152, 252, 228, 0.1)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.div
          className="h-full relative flex flex-col justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <motion.div
              key={index}
              className="grid grid-cols-2 gap-y-3 mb-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 0.4 }}
              transition={{
                delay: index * 0.1,
                duration: 0.5,
              }}
            >
              <div className="h-4 w-24 bg-primary/20 rounded"></div>
              <div className="h-4 w-16 bg-gray-400/20 rounded ml-auto"></div>
            </motion.div>
          ))}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>
      </motion.div>

      <motion.div
        className="price-table p-6 backdrop-blur-sm bg-[#0A1E23]/30 border border-primary/20 rounded-lg overflow-hidden h-full"
        initial={{ opacity: 0.5 }}
        animate={{
          opacity: [0.5, 0.7, 0.5],
          borderColor: [
            "rgba(152, 252, 228, 0.1)",
            "rgba(152, 252, 228, 0.3)",
            "rgba(152, 252, 228, 0.1)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        <motion.div
          className="h-full relative flex flex-col justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <motion.div
              key={index}
              className="grid grid-cols-2 gap-y-3 mb-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 0.4 }}
              transition={{
                delay: 0.5 + index * 0.1,
                duration: 0.5,
              }}
            >
              <div className="h-4 w-24 bg-primary/20 rounded"></div>
              <div className="h-4 w-16 bg-gray-400/20 rounded ml-auto"></div>
            </motion.div>
          ))}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              delay: 0.5,
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
