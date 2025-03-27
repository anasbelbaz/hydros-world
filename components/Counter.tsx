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
          className="border-none w-10 h-10 rounded-full bg-transparent text-teal-400 border-teal-400/50 hover:bg-transparent hover:text-teal-300 opacity-30 hover:opacity-100"
          disabled={amount <= 1 || disabled}
        >
          <svg
            width="16"
            height="2"
            viewBox="0 0 16 2"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1H15"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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
          className="border-none w-10 h-10 rounded-full bg-transparent text-teal-400 border-teal-400/50 hover:bg-transparent hover:text-teal-300 opacity-30 hover:opacity-100"
          disabled={amount >= getMaxAmount() || disabled}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 1V15M1 8H15"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </motion.div>
    </div>
  );
}
