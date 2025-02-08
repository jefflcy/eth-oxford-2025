"use client";

import { Globe } from "@/components/ui/globe";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { motion } from "framer-motion";

export default function Home() {
  const handleLogin = () => {
    console.log("Navigating to login page...");
    // Simulate login and navigation
    createOrder();
    acceptOrder();
    recordFiatPayment();
    claimTokens();
  };

  const createOrder = () => {
    console.log("createOrder function triggered by onChainSeller");
    // Implement createOrder logic here
  };

  const acceptOrder = () => {
    console.log("acceptOrder function triggered by offChainBuyer");
    // Implement acceptOrder logic here
  };

  const recordFiatPayment = () => {
    console.log("recordFiatPayment function triggered by the service");
    // Implement recordFiatPayment logic here
  };

  const claimTokens = () => {
    console.log("claimTokens function triggered by offChainSeller");
    // Implement claimTokens logic here
  };

  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        <div className="text-3xl md:text-7xl font-bold dark:text-white text-center">
          Background <br /> lights are cool you know.
        </div>
        <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 py-4">
          And this, is chemical burn.
        </div>
        <button className="bg-black dark:bg-white rounded-full w-fit text-white dark:text-black px-4 py-2">
          Debug now
        </button>
        <button
          onClick={handleLogin}
          className="mt-4 bg-blue-500 text-white rounded-full px-6 py-2"
        >
          Connect Wallet
        </button>
      </motion.div>
        <Globe />
    </AuroraBackground>
  );
}