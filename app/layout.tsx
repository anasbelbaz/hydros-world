import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Rajdhani } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import { Web3Providers } from "../lib/providers";
import { Toaster } from "@/components/ui/sonner";

// import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani",
});

export const metadata: Metadata = {
  title: "Hydros - Citizen of Hydropolis",
  description: "Hydros NFT collection - Citizen of Hydropolis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${rajdhani.variable} antialiased relative`}
        style={{
          fontFamily: "'Rajdhani', 'Herculanum', sans-serif",
          backgroundColor: "rgba(8, 16, 19, 1)",
        }}
      >
        <div
          className="absolute inset-0 z-[-1]"
          style={{
            backgroundImage: "url('/images/background.png')",
            backgroundSize: "cover",
            // backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          }}
        />
        <div
          className="absolute inset-0 z-[-1]"
          style={{
            mixBlendMode: "color-dodge",
            backgroundColor: "rgba(10, 20, 23, 0.2)",
          }}
        />
        <Web3Providers>
          <div className="flex flex-col min-h-screen relative">
            <Navbar />
            <main className="flex-1 flex">{children}</main>
            {/* <Footer /> */}
          </div>
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            duration={5000}
          />
        </Web3Providers>
      </body>
    </html>
  );
}

// function ParticlesBackground() {
//   return (
//     <div className="particles-bg">
//       {Array.from({ length: 20 }).map((_, index) => (
//         <div
//           key={index}
//           className="particle"
//           style={{
//             width: `${Math.random() * 20 + 5}px`,
//             height: `${Math.random() * 20 + 5}px`,
//             left: `${Math.random() * 100}%`,
//             top: `${Math.random() * 100}%`,
//             animationDelay: `${Math.random() * 10}s`,
//             animationDuration: `${Math.random() * 10 + 10}s`,
//             opacity: Math.random() * 0.5,
//           }}
//         />
//       ))}
//     </div>
//   );
// }
