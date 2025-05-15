// flaregate/src/lib/fdc.ts

// NOTE: In a frontend Next.js app you normally do not use require('dotenv').config() – 
// instead, set your environment variables in .env.local (with NEXT_PUBLIC_ prefixes).
// For demonstration, we still log one variable.
require("dotenv").config();

import { ethers } from "ethers";
import { FDC_HUB_ABI, FDC_HUB_ADDRESS_COSTON2, marketplaceAddress, marketplaceABI } from "./marketplaceContract"; 

// A helper function to convert a string to hex.
export function toHex(data: string): string {
  let result = "";
  for (let i = 0; i < data.length; i++) {
    result += data.charCodeAt(i).toString(16);
  }
  return result.padEnd(64, "0");
}

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x123";
const JQ_VERIFIER_URL_TESTNET = process.env.NEXT_PUBLIC_JQ_VERIFIER_URL_TESTNET || "https://jq-verifier-test.flare.rocks/";
const JQ_API_KEY = process.env.NEXT_PUBLIC_JQ_API_KEY || "flare-oxford-2025";

const FLARE_RPC_API_KEY = "00000000-0000-0000-0000-000000000000"
const FLARE_RPC_URL = "https://rpc.ankr.com/flare_coston2" +(FLARE_RPC_API_KEY ? `?x-apikey=${FLARE_RPC_API_KEY}` : "");

const DA_LAYER_URL_COSTON2 = "https://ctn2-data-availability.flare.network/api/v1/"
// const WEB2_JSON_API_URL = "https://pastes.io/download/sample-payments-webhook-response-1"; // MOCK DATA

let abiEncodedRequest = ''; // TO REDUCE NUMBER OF PREPARE REQUEST CALLS

/* --------------------------------------------------- prepareRequest --------------------------------------------------- */
export async function prepareRequest(web2APIURL: string) {
  const attestationType = "0x" + toHex("IJsonApi");
  const sourceType = "0x" + toHex("WEB2");
  const requestData = {
    attestationType: attestationType,
    sourceId: sourceType,
    requestBody: {
      url: web2APIURL,
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
  const data: any = await response.json();
  console.log("prepareRequest response:", data);

  // store the abiEncodedRequest for later use
  abiEncodedRequest = data.abiEncodedRequest;

  return data;
}

/* --------------------------------------------------- requestAttestation (submitRequest) --------------------------------------------------- */
const firstVotingRoundStartTs = 1658430000; // coston2
const votingEpochDurationSeconds = 90; // coston2

export async function submitRequest() {
  // const requestData: any = await prepareRequest();

  if (!abiEncodedRequest) {
    throw new Error("Missing abiEncodedRequest");
  }

  const provider = new ethers.JsonRpcProvider(FLARE_RPC_URL);

  // Instead of using provider.getSigner(), we create a Wallet from our private key.
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // Connect the wallet to the provider.
  const connectedWallet = wallet.connect(provider);

  const contract = new ethers.Contract(
    FDC_HUB_ADDRESS_COSTON2,
    FDC_HUB_ABI,
    connectedWallet
  );
  const tx = await contract.requestAttestation(abiEncodedRequest, {
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
  if (!abiEncodedRequest) {
    throw new Error("Missing abiEncodedRequest");
  }

  const url = `${DA_LAYER_URL_COSTON2}fdc/proof-by-request-round`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": JQ_API_KEY,
    },
    body: JSON.stringify({
      votingRoundId: roundId,
      requestBytes: abiEncodedRequest,
    }),
  });
  const data = await response.json() as {proof: any, response: any};
  console.log("getProof response:", data);
  return data;
}

/* --------------------------------------------------- submitProof --------------------------------------------------- */
export async function submitProof(roundId: number) {
  let response: object | undefined;
  let proofAndData;
  while (!response || Object.keys(response).length === 0) {
    proofAndData = await getProof(roundId);
    console.log("Proof and data in while loop:", proofAndData);
    response = proofAndData?.response;
    console.log("Response in proofAndData in while loop:", response);
    if (!response || Object.keys(response).length === 0) {
      console.log("Waiting to call getProof again...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
  console.log("Proof and data:", proofAndData);

  const provider = new ethers.JsonRpcProvider(FLARE_RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const marketplace = new ethers.Contract(marketplaceAddress, marketplaceABI, wallet);

  try {
    const tx = await marketplace.recordFiatPayment({
      merkleProof: proofAndData?.proof,
      data: proofAndData?.response,
    });

    console.log("Submitted proof, tx.hash:", tx.hash);
    return tx.hash;

  } catch (error) {
    console.error("Failed to submit proof:", error);
    throw error;
  }
}