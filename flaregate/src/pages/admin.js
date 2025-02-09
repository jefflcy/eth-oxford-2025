"use client";

require('dotenv').config();

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { prepareRequest } from "@/lib/fdc"; // Updated import
import { NavBar } from "../components/ui/NavBar";

// A simple fetcher function for SWR
const fetcher = (url) => fetch(url).then((res) => res.json());

// --- Dummy simulation functions for additional steps ---
function simulateSubmitRequest() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(1234);
    }, 90000);
  });
}

function simulateSubmitProof() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("0xTXHASH123");
    }, 2000);
  });
}

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
  const [prepareStatus, setPrepareStatus] = useState("idle");
  const [attestationStatus, setAttestationStatus] = useState("idle");
  const [updateStatus, setUpdateStatus] = useState("idle");
  const [roundId, setRoundId] = useState(null);
  const [txHash, setTxHash] = useState(null);

  // --- Handlers for each step ---
  const handlePrepareRequest = async () => {
    setPrepareStatus("loading");
    const result = await prepareRequest();
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@ result:', result);
    setPrepareStatus("done");
  };

  const handleRequestAttestation = async () => {
    setAttestationStatus("loading");
    const result = await simulateSubmitRequest();
    setRoundId(result);
    setAttestationStatus("done");
  };

  const handleUpdateContract = async () => {
    setUpdateStatus("loading");
    const result = await simulateSubmitProof();
    setTxHash(result);
    setUpdateStatus("done");
  };

  // --- Automatically trigger steps sequentially ---
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
            <span className="text-green-500">Request prepared.</span>
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
              href={`http://coston2-systems-explorer.flare.rocks/voting-epoch/${roundId}?tab=fdc`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF69B4] underline"
            >
              View Attestation (Round {roundId})
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
