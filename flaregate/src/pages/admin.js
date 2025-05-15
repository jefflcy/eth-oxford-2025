"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { prepareRequest, submitRequest, submitProof } from "@/lib/fdc";
import NavBar from "@/components/ui/Navbar";

// A simple fetcher function for SWR (for Step 1)
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Admin() {
  const router = useRouter();
  const { orderId } = router.query;

  // --- Step 1: Payment API Response ---
  const externalUrl = orderId
    ? `https://pastes.io/download/sample-payment-webhook-response-${parseInt(orderId) + 1}`
    : null;
  const proxyUrl = externalUrl ? `/api/proxy?url=${encodeURIComponent(externalUrl)}` : null;
  const { data, error } = useSWR(proxyUrl, fetcher);
  const step1Completed = !!data && !error;

  // --- Multi-step state for Steps 2–4 ---
  const [prepareStatus, setPrepareStatus] = useState("idle"); // "idle", "loading", "done"
  const [attestationStatus, setAttestationStatus] = useState("idle"); // "idle", "loading", "done"
  const [updateStatus, setUpdateStatus] = useState("idle"); // "idle", "loading", "done"
  const [roundIdValue, setRoundIdValue] = useState(null);
  const [txHash, setTxHash] = useState(null);

  // Handler for Step 2: Prepare Request
  const handlePrepareRequest = async () => {
    setPrepareStatus("loading");
    try {
      const result = await prepareRequest(externalUrl);
      console.log("Prepare Request result:", result);
      setPrepareStatus("done");
    } catch (err) {
      console.error("Error in prepareRequest:", err);
      setPrepareStatus("idle");
    }
  };

  // Handler for Step 3: Request Attestation using submitRequest
  const handleRequestAttestation = async () => {
    setAttestationStatus("loading");
    try {
      const result = await submitRequest();
      console.log("Attestation result (roundId):", result);
      setRoundIdValue(result);
      setAttestationStatus("done");
    } catch (err) {
      console.error("Error in submitRequest:", err);
      setAttestationStatus("idle");
    }
  };

  // Handler for Step 4: Update Contract State using submitProof
  const handleUpdateContract = async () => {
    setUpdateStatus("loading");

    const delay = 100 * 1000; // 100 seconds
    console.log(`Delaying submitProof for ${delay / 1000} seconds...`);
  
    setTimeout(async () => {
      try {
        console.log("Submitting proof with roundId:", roundIdValue);
        const result = await submitProof(roundIdValue);
        console.log("Update Contract result (tx hash):", result);
        setTxHash(result);
        setUpdateStatus("done");
      } catch (err) {
        console.error("Error in submitProof:", err);
        setUpdateStatus("idle");
      }
    }, delay);
  };

  // Automatically trigger steps sequentially.
  useEffect(() => {
    if (step1Completed && prepareStatus === "idle") {
      handlePrepareRequest();
    }
  }, [step1Completed, prepareStatus]);

  useEffect(() => {
    if (prepareStatus === "done" && attestationStatus === "idle") {
      handleRequestAttestation();
    }
  }, [prepareStatus, attestationStatus]);

  useEffect(() => {
    if (attestationStatus === "done" && updateStatus === "idle") {
      handleUpdateContract();  
    }
  }, [attestationStatus, updateStatus]);

  if (!orderId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <NavBar />
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4 text-[#FF69B4]">Admin Order {orderId}</h1>

        {/* Step 1: Payment API Response */}
        <div className="mb-6 border p-4 rounded shadow">
          <div className="flex items-center mb-2">
            {step1Completed ? (
              <span className="text-green-500 mr-2">✓</span>
            ) : (
              <span className="w-4 h-4 border-2 border-[#FF69B4] border-t-transparent rounded-full animate-spin mr-2"></span>
            )}
            <span className="font-semibold">Step 1: Payment API Response</span>
          </div>
          {step1Completed ? (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF69B4] underline"
            >
              View Payment Response
            </a>
          ) : (
            <span>Loading payment response...</span>
          )}
        </div>

        {/* Step 2: Prepare Request */}
        <div className="mb-6 border p-4 rounded shadow">
          <div className="flex items-center mb-2">
            {prepareStatus === "done" ? (
              <span className="text-green-500 mr-2">✓</span>
            ) : prepareStatus === "loading" ? (
              <span className="w-4 h-4 border-2 border-[#FF69B4] border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : (
              <span className="mr-2">○</span>
            )}
            <span className="font-semibold">Step 2: Prepare Request</span>
          </div>
          {prepareStatus === "loading" && <span>Preparing request...</span>}
          {prepareStatus === "done" && (
            <span className="text-green-500">Request: VALID.</span>
          )}
        </div>

        {/* Step 3: Request Attestation */}
        <div className="mb-6 border p-4 rounded shadow">
          <div className="flex items-center mb-2">
            {attestationStatus === "done" ? (
              <span className="text-green-500 mr-2">✓</span>
            ) : attestationStatus === "loading" ? (
              <span className="w-4 h-4 border-2 border-[#FF69B4] border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : (
              <span className="mr-2">○</span>
            )}
            <span className="font-semibold">Step 3: Request Attestation</span>
          </div>
          {attestationStatus === "loading" && (
            <span>Waiting for attestation (90 sec)...</span>
          )}
          {attestationStatus === "done" && (
            <a
              href={`http://coston2-systems-explorer.flare.rocks/voting-epoch/${roundIdValue}?tab=fdc`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF69B4] underline"
            >
              View Attestation (Round {roundIdValue})
            </a>
          )}
        </div>

        {/* Step 4: Update Contract State */}
        <div className="mb-6 border p-4 rounded shadow">
          <div className="flex items-center mb-2">
            {updateStatus === "done" ? (
              <span className="text-green-500 mr-2">✓</span>
            ) : updateStatus === "loading" ? (
              <span className="w-4 h-4 border-2 border-[#FF69B4] border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : (
              <span className="mr-2">○</span>
            )}
            <span className="font-semibold">Step 4: Update Contract State</span>
          </div>
          {updateStatus === "loading" && <span>Updating contract state...</span>}
          {updateStatus === "done" && (
            <a
              href={`https://coston2-explorer.flare.network/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF69B4] underline"
            >
              View Transaction ({txHash})
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
