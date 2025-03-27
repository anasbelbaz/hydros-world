"use client";

import { useRef, useEffect, useState } from "react";
import { frame, cancelFrame } from "framer-motion";
import ReactLenis, { LenisRef } from "lenis/react";
import { usePathname } from "next/navigation";

import Navbar from "../components/Navbar";
import { Toaster } from "@/components/ui/sonner";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Ce useEffect s'exécute une fois le composant monté
    setMounted(true);
  }, []);

  useEffect(() => {
    function update({ timestamp }: { timestamp: number }) {
      lenisRef.current?.lenis?.raf(timestamp);
    }

    frame.update(update, true);
    return () => cancelFrame(update);
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current?.lenis;

    if (!lenis) return;

    function onScroll() {
      if (pathname === "/") {
        const scrollY = lenis.scroll;
        setIsDark(scrollY < Math.max(window.innerHeight, 800));
      } else {
        setIsDark(false);
      }
    }

    lenis.on("scroll", onScroll);
    onScroll(); // Vérifier l'état au chargement de la page

    return () => {
      lenis.off("scroll", onScroll);
    };
  }, [pathname, mounted]);

  return (
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
      <div className="flex flex-col min-h-screen relative overflow-hidden">
        <Navbar className={isDark ? "navbar-dark" : ""} />
        <main className="flex-1 flex md:mt-[94px] mt-[82px]">{children}</main>
      </div>
      <Toaster position="bottom-right" richColors closeButton duration={5000} />
    </ReactLenis>
  );
}
