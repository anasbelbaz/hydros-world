"use client";

import { useRef, useEffect } from "react";
import { frame, cancelFrame } from "framer-motion";
import ReactLenis, { LenisRef } from "lenis/react";

import Navbar from "../components/Navbar";
import { Toaster } from "@/components/ui/sonner";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    function update({ timestamp }: { timestamp: number }) {
      lenisRef.current?.lenis?.raf(timestamp);
    }

    frame.update(update, true);
    return () => cancelFrame(update);
  }, []);

  return (
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
      <div className="flex flex-col min-h-screen relative overflow-hidden">
        <Navbar />
        <main className="flex-1 flex md:mt-[94px] mt-[82px]">{children}</main>
      </div>
      <Toaster position="bottom-right" richColors closeButton duration={5000} />
    </ReactLenis>
  );
}
