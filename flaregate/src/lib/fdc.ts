// flaregate/src/lib/fdc.ts

require('dotenv').config();

// A helper function to convert a string to hex.
export function toHex(data: string): string {
    let result = "";
    for (let i = 0; i < data.length; i++) {
      result += data.charCodeAt(i).toString(16);
    }
    return result.padEnd(64, "0");
  }
  
  // Use environment variables that are exposed to the client.
  const NEXT_PUBLIC_JQ_VERIFIER_URL_TESTNET = "https://jq-verifier-test.flare.rocks/"
  const NEXT_PUBLIC_JQ_API_KEY = "flare-oxford-2025"
  const WEB2_JSON_API_URL = "https://pastes.io/download/sample-payments-webhook-response-1"; // MOCK DATA
  
  export async function prepareRequest() {
    const requestData = {
      attestationType: "0x" + toHex("IJsonApi"),
      sourceId: "0x" + toHex("WEB2"),
      requestBody: {
        url: WEB2_JSON_API_URL,
        postprocessJq: ". | .paidAmt = (.paidAmt * 100 | floor)",
        abi_signature:
          '{"components": [{"internalType": "uint256","name": "onChainOrderId","type": "uint256"},{"internalType": "address","name": "onChainSeller","type": "address"},{"internalType": "uint256","name": "paidAmt","type": "uint256"},{"internalType": "string","name": "paidCurrency","type": "string"},{"internalType": "uint256","name": "paidTimestamp","type": "uint256"},{"internalType": "string","name": "offChainReference","type": "string"}],"name": "payment","type": "tuple"}'
      }
    };
  
    console.log("prepareRequest requestData:", requestData);
    console.log(`${NEXT_PUBLIC_JQ_VERIFIER_URL_TESTNET}JsonApi/prepareRequest`)
    const response = await fetch(
      `${NEXT_PUBLIC_JQ_VERIFIER_URL_TESTNET}JsonApi/prepareRequest`,
      {
        method: "POST",
        headers: {
          "X-API-KEY": NEXT_PUBLIC_JQ_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      }
    );

    const data = await response.json();
    console.log("prepareRequest response:", data);
    return data;
  }
  