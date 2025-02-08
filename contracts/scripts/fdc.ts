import { artifacts, ethers, run } from "hardhat";
// import { StarWarsCharacterListInstance } from "../typechain-types";

const StarWarsCharacterList = artifacts.require("StarWarsCharacterList");
const FDCHub = artifacts.require("@flarenetwork/flare-periphery-contracts/coston/IFdcHub.sol:IFdcHub");

// Simple hex encoding
function toHex(data: string) {
    var result = "";
    for (var i = 0; i < data.length; i++) {
        result += data.charCodeAt(i).toString(16);
    }
    return result.padEnd(64, "0");
}

const { JQ_VERIFIER_URL_TESTNET, JQ_API_KEY, DA_LAYER_URL_COSTON2 } = process.env;
const WEB2_JSON_API_URL = "https://pastes.io/download/sample-payments-webhook-response-1";

// async function deployMarketplace() {
    //     const list: StarWarsCharacterListInstance = await StarWarsCharacterList.new();
    
    //     console.log("Char list deployed at:", list.address);
    //     // verify 
    //     const result = await run("verify:verify", {
        //         address: list.address,
        //         constructorArguments: [],
        //     })
        // }
        
        // deployMainList().then((data) => {
            //     process.exit(0);
            // });
            
const STAR_WARS_LIST_ADDRESS = "0x531B6E1e924aa8b431D1cacF517468DF2c3faa4F"; // coston2

/* --------------------------------------------------- prepareRequest --------------------------------------------------- */

async function prepareRequest() {
    const attestationType = "0x" + toHex("IJsonApi");
    const sourceType = "0x" + toHex("WEB2");
    const requestData = {
        attestationType: attestationType,
        sourceId: sourceType,
        requestBody: {
            url: WEB2_JSON_API_URL,
            postprocessJq: ". | .paidAmt = (.paidAmt * 100 | floor)",
            abi_signature: "{\"components\": [{\"internalType\": \"uint256\",\"name\": \"onChainOrderId\",\"type\": \"uint256\"},{\"internalType\": \"address\",\"name\": \"onChainSeller\",\"type\": \"address\"},{\"internalType\": \"uint256\",\"name\": \"paidAmt\",\"type\": \"uint256\"},{\"internalType\": \"string\",\"name\": \"paidCurrency\",\"type\": \"string\"},{\"internalType\": \"uint256\",\"name\": \"paidTimestamp\",\"type\": \"uint256\"},{\"internalType\": \"string\",\"name\": \"offChainReference\",\"type\": \"string\"}],\"name\": \"payment\",\"type\": \"tuple\"}"
        }
    };
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@ requestData:', requestData);

    const response = await fetch(
        `${JQ_VERIFIER_URL_TESTNET}JsonApi/prepareRequest`,
        {
            method: "POST",
            headers: {
                "X-API-KEY": JQ_API_KEY!,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        },
    );
    const data = await response.json();
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@ response.json() from prepareRequest:', data);

    return data;
}

// prepareRequest().then((data) => {
//     console.log("Prepared request:", data);
//     process.exit(0);
// });

/* --------------------------------------------------- requestAttestation --------------------------------------------------- */

// In production get the data directly from FlareSystemsManager: 0xA90Db6D10F856799b10ef2A77EBCbF460aC71e52 for coston2
const firstVotingRoundStartTs = 1658430000; // coston2
const votingEpochDurationSeconds = 90; // coston2

async function submitRequest() {
    const requestData = await prepareRequest();

    // const starWarsList: StarWarsCharacterListInstance = await StarWarsCharacterList.at(STAR_WARS_LIST_ADDRESS);

    // const fdcHUB = await FDCHub.at(await starWarsList.getFdcHub());
    const fdcHUB = await FDCHub.at("0x48aC463d7975828989331F4De43341627b9c5f1D"); // coston2

    // Call to the FDC Hub protocol to provide attestation.
    const tx = await fdcHUB.requestAttestation(requestData.abiEncodedRequest, {
        value: ethers.parseEther("1").toString(),
    });
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@ Submitted request (tx.tx):', tx.tx);

    // Get block number of the block containing contract call
    const blockNumber = tx.blockNumber;
    const block = await ethers.provider.getBlock(blockNumber);

    // Calculate roundId
    const roundId = Math.floor(
        (block!.timestamp - firstVotingRoundStartTs) / votingEpochDurationSeconds,
    );
    console.log(
        `Check round progress at: https://coston2-systems-explorer.flare.rocks/voting-epoch/${roundId}?tab=fdc`,
    );
    return roundId;
}

// submitRequest().then((data) => {
//     console.log("Submitted request:", data);
//     process.exit(0);
// });

/* --------------------------------------------------- get proof from DA Layer --------------------------------------------------- */

async function getProof(roundId: number) {
    const request = await prepareRequest();
    const proofAndData = await fetch(
        `${DA_LAYER_URL_COSTON2}fdc/get-proof-round-id-bytes`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": JQ_API_KEY!,
            },
            body: JSON.stringify({
                votingRoundId: roundId,
                requestBytes: request.abiEncodedRequest,
            }),
        },
    );
    return await proofAndData.json();
}

// getProof(TARGET_ROUND_ID)
//     .then((data) => {
//         console.log("Proof and data:");
//         console.log(JSON.stringify(data, undefined, 2));
//     })
//     .catch((e) => {
//         console.error(e);
//     });

/* --------------------------------------------------- submit proof --------------------------------------------------- */

async function submitProof(proofAndData?: any) {
    // const dataAndProof = await getProof(TARGET_ROUND_ID);
    // console.log(dataAndProof);
    const starWarsList = await StarWarsCharacterList.at(STAR_WARS_LIST_ADDRESS);

    const tx = await starWarsList.addCharacter({
        merkleProof: proofAndData.proof,
        data: proofAndData.response,
    });
    console.log(tx.tx);
    console.log(await starWarsList.getAllCharacters());
}


// submitProof()
//     .then((data) => {
//         console.log("Submitted proof");
//         process.exit(0);
//     })
//     .catch((e) => {
//         console.error(e);
//     });
