// flaregate/src/lib/fdc.ts

// NOTE: In a frontend Next.js app you normally do not use require('dotenv').config() – 
// instead, set your environment variables in .env.local (with NEXT_PUBLIC_ prefixes).
// For demonstration, we still log one variable.
require("dotenv").config();

import { ethers } from "ethers";
import { FDC_HUB_ABI, FDC_HUB_ADDRESS_COSTON2 } from "./marketplaceContract"; // Ensure these are exported correctly

// A helper function to convert a string to hex.
export function toHex(data: string): string {
  let result = "";
  for (let i = 0; i < data.length; i++) {
    result += data.charCodeAt(i).toString(16);
  }
  return result.padEnd(64, "0");
}

// Hardcoded environment values – in production these should come from your .env.local
const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  "8c22e5f6a639530efe6cd9afa780c461890fff475d4dc7fee163628d945fc5f3";
const JQ_VERIFIER_URL_TESTNET =
  process.env.NEXT_PUBLIC_JQ_VERIFIER_URL_TESTNET ||
  "https://jq-verifier-test.flare.rocks/";
const JQ_API_KEY =
  process.env.NEXT_PUBLIC_JQ_API_KEY || "flare-oxford-2025";
console.log("JQ_API_KEY:", process.env.NEXT_PUBLIC_JQ_API_KEY);
// Note: The DA layer URL below should normally be an HTTPS URL. Adjust as needed.
const DA_LAYER_URL_COSTON2 = "http://0.0.0.0:8080/ctn2-data-availability.flare.network/api/v1/"
const WEB2_JSON_API_URL =
  "https://pastes.io/download/sample-payments-webhook-response-1"; // MOCK DATA

/* --------------------------------------------------- prepareRequest --------------------------------------------------- */
export async function prepareRequest() {
  const attestationType = "0x" + toHex("IJsonApi");
  const sourceType = "0x" + toHex("WEB2");
  const requestData = {
    attestationType: attestationType,
    sourceId: sourceType,
    requestBody: {
      url: WEB2_JSON_API_URL,
      postprocessJq: ". | .paidAmt = (.paidAmt * 100 | floor)",
      abi_signature:
        '{"components": [{"internalType": "uint256","name": "onChainOrderId","type": "uint256"},{"internalType": "address","name": "onChainSeller","type": "address"},{"internalType": "uint256","name": "paidAmt","type": "uint256"},{"internalType": "string","name": "paidCurrency","type": "string"},{"internalType": "uint256","name": "paidTimestamp","type": "uint256"},{"internalType": "string","name": "offChainReference","type": "string"}],"name": "payment","type": "tuple"}'
    }
  };

  console.log("prepareRequest requestData:", requestData);

  const url = `${JQ_VERIFIER_URL_TESTNET}JsonApi/prepareRequest`;
  console.log("POST URL:", url);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "X-API-KEY": JQ_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });
  const data = await response.json();
  console.log("prepareRequest response:", data);
  return data;
}

/* --------------------------------------------------- requestAttestation (submitRequest) --------------------------------------------------- */
const firstVotingRoundStartTs = 1658430000; // coston2
const votingEpochDurationSeconds = 90; // coston2

export async function submitRequest() {
  // Get the prepared request data.
  const requestData: any = await prepareRequest();
  if (!requestData.abiEncodedRequest) {
    throw new Error("Invalid response format: missing abiEncodedRequest");
  }

  // Create a JSON-RPC provider using an HTTPS URL.
  const FLARE_RPC_API_KEY = process.env.NEXT_PUBLIC_FLARE_RPC_API_KEY || "";
  const rpcUrl =
    "https://rpc.ankr.com/flare_coston2" +
    (FLARE_RPC_API_KEY ? `?x-apikey=${FLARE_RPC_API_KEY}` : "");
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // Instead of using provider.getSigner(), we create a Wallet from our private key.
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // Connect the wallet to the provider.
  const connectedWallet = wallet.connect(provider);

  const contract = new ethers.Contract(
    FDC_HUB_ADDRESS_COSTON2,
    FDC_HUB_ABI,
    connectedWallet
  );
  const tx = await contract.requestAttestation(requestData.abiEncodedRequest, {
    value: ethers.parseEther("1").toString(),
  });
  console.log("Submitted request, tx.hash:", tx.hash);

  // Wait for the transaction to be mined.
  const receipt = await tx.wait();
  const blockNumber = receipt.blockNumber;
  const block = await provider.getBlock(blockNumber);
  if (!block) {
    throw new Error("Failed to retrieve block information");
  }

  // Calculate roundId.
  const roundId = Math.floor(
    (block.timestamp - firstVotingRoundStartTs) / votingEpochDurationSeconds
  );
  console.log(
    `Round ID: ${roundId}. Check round progress at: https://coston2-systems-explorer.flare.rocks/voting-epoch/${roundId}?tab=fdc`
  );
  return roundId;
}

/* --------------------------------------------------- getProof --------------------------------------------------- */
export async function getProof(roundId: number) {
  // Add a delay if you need to slow down the frequency of calls
  await new Promise((resolve) => setTimeout(resolve, 5000));
  const request: any = await prepareRequest();
  const url = `${DA_LAYER_URL_COSTON2}fdc/proof-by-request-round`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": JQ_API_KEY,
    },
    body: JSON.stringify({
      votingRoundId: roundId,
      requestBytes: request.abiEncodedRequest,
    }),
  });
  const data = await response.json();
  console.log("getProof response:", data);
  return data;
}

/* --------------------------------------------------- submitProof --------------------------------------------------- */
export async function submitProof(roundId: number) {
  const proofAndData = await getProof(roundId);
  console.log("Proof and data:", proofAndData);
  const data = (proofAndData as any).data;
  console.log("Data:", data);
  return data;

//   const FLARE_RPC_API_KEY = process.env.NEXT_PUBLIC_FLARE_RPC_API_KEY || "";
//   const rpcUrl =
//     "https://rpc.ankr.com/flare_coston2" +
//     (FLARE_RPC_API_KEY ? `?x-apikey=${FLARE_RPC_API_KEY}` : "");
//   const provider = new ethers.JsonRpcProvider(rpcUrl);
//   const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
//   const { marketplaceAddress, marketplaceABI } = await import("./marketplaceContract");
//   const marketplace = new ethers.Contract(marketplaceAddress, marketplaceABI, wallet);
//   if (typeof proofAndData !== "object" || proofAndData === null) {
//     throw new Error("Invalid proofAndData");
//   }

//   const tx = await marketplace.recordFiatPayment({
//     merkleProof: proofAndData.proof,
//     data: proofAndData.response,
//   });
//   console.log("Submitted proof, tx.hash:", tx.hash);
//   return tx.hash;
}
