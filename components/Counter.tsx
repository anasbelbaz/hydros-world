import { motion } from "framer-motion";
import { Button } from "./ui/button";

type CounterProps = {
  amount: number;
  handleDecrement: () => void;
  handleIncrement: () => void;
  getMaxAmount: () => number;
  disabled?: boolean;
};

export function Counter({
  amount,
  handleDecrement,
  handleIncrement,
  getMaxAmount,
  disabled,
}: CounterProps) {
  return (
    <div className="flex items-center justify-center gap-6 mb-4 border border-primary/30 rounded-full p-4 w-[300px] h-[80px]">
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          onClick={handleDecrement}
          variant="outline"
          size="icon"
          className="border-none w-10 h-10 rounded-full bg-transparent text-teal-400 border-teal-400/50 hover:bg-transparent hover:text-teal-300"
          disabled={amount <= 1 || disabled}
        >
          <span className="text-5xl text-teal-50">-</span>
        </Button>
      </motion.div>

      <motion.div
        className="text-4xl font-herculanum text-teal-300 w-16 text-center"
        key={amount}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {amount}
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          onClick={handleIncrement}
          variant="outline"
          size="icon"
          className="border-none w-10 h-10 rounded-full bg-transparent text-teal-400 border-teal-400/50 hover:bg-transparent hover:text-teal-300"
          disabled={amount >= getMaxAmount() || disabled}
        >
          <span className="text-5xl text-teal-50">+</span>
        </Button>
      </motion.div>
    </div>
  );
}
