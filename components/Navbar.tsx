"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectButton } from "./ConnectButton";
import { useSaleInfoTestnet } from "@/lib/hooks/useSaleInfoTestnet";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  const { data: saleInfo } = useSaleInfoTestnet();
  const unrevealedTokens = saleInfo?.unrevealedTokens;

  // Handle window resize to determine if mobile view should be used
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1080);
    };

    // Set initial value
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { href: "/", label: "HOME" },
    { href: "/mint", label: "MINT" },
    { href: "/reveal", label: "REVEAL" },
    { href: "/collection", label: "COLLECTION" },
  ];

  return (
    <header className="w-full py-6 px-4 lg:px-8 bg-transparent relative z-50">
      <div className="mx-auto flex items-center justify-between">
        {/* Hamburger Menu (Mobile) */}
        <div className="lg:hidden z-20">
          <button
            onClick={toggleMenu}
            className="flex flex-col justify-center items-center w-8 h-8 border border-primary/30 rounded p-1"
            aria-label="Toggle Menu"
          >
            <span
              className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                isMenuOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"
              }`}
            ></span>
            <span
              className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            ></span>
            <span
              className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                isMenuOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5"
              }`}
            ></span>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? "active" : ""}`}
              style={{ fontFamily: "'Herculanum', 'Rajdhani', sans-serif" }}
            >
              {link.label}{" "}
              {link.href === "/reveal" && unrevealedTokens?.length > 0 && (
                <span className="text-teal-50 font-herculanum text-[16px] bg-teal-500/30 px-2 py-1 rounded-full ">
                  {unrevealedTokens?.length}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="lg:hidden fixed inset-0  backdrop-blur-sm z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.nav
                className="flex flex-col items-center justify-center h-full gap-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, staggerChildren: 0.1 }}
              >
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className={`nav-link ${
                        pathname === link.href ? "active" : ""
                      }`}
                      style={{
                        fontFamily: "'Herculanum', 'Rajdhani', sans-serif",
                      }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logo (Center) */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Image
                src="/images/hydros-logo.png"
                alt="Hydros Logo"
                width={isMobile ? 60 : 120}
                height={isMobile ? 30 : 60}
                priority
                className="transition-transform lg:w-[120px] lg:h-[60px] w-[60px] h-[30px]"
              />
            </motion.div>
          </Link>
        </div>

        {/* Connect Button or Wallet Info (Right) */}
        <div className="flex flex-col items-center space-x-2">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
