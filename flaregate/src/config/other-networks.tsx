import { defineChain } from "@reown/appkit/networks";

const FLARE_RPC_API_KEY = process.env.FLARE_RPC_API_KEY;

export const flareCoston2 = defineChain({
    id: 114,
    chainNamespace: "eip155",
    caipNetworkId: "eip155:114",
    name: "Coston2 Testnet",
    nativeCurrency: {
        decimals: 18,
        name: "C2FLR",
        symbol: "C2FLR",
    },
    rpcUrls: {
        default: {
            http: ["https://rpc.ankr.com/flare_coston2" + (FLARE_RPC_API_KEY ? `?x-apikey=${FLARE_RPC_API_KEY}` : "")],
        },
    },
    blockExplorers: {
        default: {
            name: "Flare Explorer",
            url: "https://coston2.testnet.flarescan.com",
        },
    },
});