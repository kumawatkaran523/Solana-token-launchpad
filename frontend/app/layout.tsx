"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Chakra_Petch } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { WalletConnectButton, WalletDisconnectButton, WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ConnectionProvider, useWallet, WalletProvider } from "@solana/wallet-adapter-react";

import '@solana/wallet-adapter-react-ui/styles.css';
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const chakra = Chakra_Petch({
  weight: '300',
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// const metadata: Metadata = {
//   title: "SolVortex",
//   description: "Solana Token Launchpad",
//   icons: {
//     icon: [
//       { url: "/icon.ico" },
//     ],
//   },
//   keywords: ["Solana", "Token", "Launchpad", "Cryptocurrency"],
// };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${chakra.className} font-chakra  antialiased min-h-screen flex flex-col bg-[#030814]`}
      >
        <ConnectionProvider endpoint="https://api.devnet.solana.com" >
          <WalletProvider wallets={[]} autoConnect>
            <WalletModalProvider>
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </body>
    </html>
  );
}

