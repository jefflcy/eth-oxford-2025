"use client"

import Navbar from "@/components/ui/Navbar";
import { Globe } from "@/components/ui/globe";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter()
  const navigateToMain = () => {
    router.push("/home"); 
  };

  return (
    <div className="min-h-screen bg-transparent text-black">
      <Navbar />
      <div className="flex flex-col items-center justify-center pt-80 mb-40"> 
        <h1 className="text-4xl md:text-6xl font-bold mb-10 text-[#FF69B4] flaregate-font">
          Welcome to FlareGate
        </h1>
        <button
          onClick={navigateToMain}
          className="px-6 py-3 bg-[#FF69B4] text-white rounded-full transition duration-200 hover:bg-[#FF5BA0] flaregate-font"
        >
          Go to Main Page
        </button>
        <Globe className="mt-20 -z-10" />
      </div>
      
      {/* <WavesDemo /> */}
    </div>
  );
}
