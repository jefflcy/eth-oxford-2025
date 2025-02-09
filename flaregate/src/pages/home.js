import Navbar from "@/components/ui/Navbar";
import { Globe } from "@/components/ui/globe";
// import { WavesDemo } from "@/components/ui/waves-background";
import { useRouter } from "next/router";

export default function LandingPage() {
  const router = useRouter();

  const navigateToMain = () => {
    router.push("/"); // routes to the main page at / (src/app/page.js)
  };

  return (
    <div className="min-h-screen bg-transparent text-black">
      {/* Render the shared Navbar */}
      <Navbar onCreateOrder={() => {}} onConnectWallet={() => {}} />
      <div className="flex flex-col items-center justify-center pt-80 mb-40"> {/* Added mt-20 for more space */}
        <h1 className="text-4xl md:text-6xl font-bold mb-10 text-[#FF69B4] flaregate-font">
          Welcome to FlareGate
        </h1>
        <button
          onClick={navigateToMain}
          className="px-6 py-3 bg-[#FF69B4] text-white rounded-full transition duration-200 hover:bg-[#FF5BA0] flaregate-font"
        >
          Go to Main Page
        </button>
        {/* Add the Globe component */}
        <Globe className="mt-20 -z-10" />
      </div>
      
      {/* Insert WavesDemo Component Here */}
      {/* <WavesDemo /> */}
    </div>
  );
}