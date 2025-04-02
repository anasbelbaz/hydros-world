"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="flex justify-center items-center ">
      <main className="flex justify-center items-center w-full">
        <motion.div
          className="flex flex-col justify-center items-center px-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-center text-7xl mb-4 text-primary"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 1,
            }}
          >
            404
          </motion.h1>
          <h2 className="hydros-title text-3xl mb-8">SECTOR NOT FOUND</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            This area of Hydropolis has not been explored yet or doesn&apos;t
            exist in our records.
          </p>

          <Link href="/" className="whitelist-button inline-block">
            RETURN HOME
          </Link>
        </motion.div>
      </main>

      <footer className="fixed bottom-4 right-4 flex space-x-2">
        <Link
          href="https://discord.gg/hydros"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-secondary/50 backdrop-blur-md p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground"
          >
            <circle cx="9" cy="12" r="1" />
            <circle cx="15" cy="12" r="1" />
            <path d="M7.5 7.5c3.5-1 5.5-1 9 0" />
            <path d="M7 16.5c3.5 1 6.5 1 10 0" />
            <path d="M15.5 17c0 1 1.5 3 2 3 1.5 0 2.833-1.667 3.5-3 .667-1.667.5-5.833-1.5-11.5-1.457-1.015-3-1.34-4.5-1.5l-1 2.5" />
            <path d="M8.5 17c0 1-1.356 3-1.832 3-1.429 0-2.698-1.667-3.333-3-.635-1.667-.48-5.833 1.428-11.5C6.151 4.485 7.545 4.16 9 4l1 2.5" />
          </svg>
        </Link>
        <Link
          href="https://twitter.com/hydros"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-secondary/50 backdrop-blur-md p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground"
          >
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
          </svg>
        </Link>
      </footer>
    </div>
  );
}
