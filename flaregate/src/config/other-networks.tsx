import { defineChain } from "@reown/appkit/networks";

export const flareConston2 = defineChain({
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
            http: ["https://coston2.api.flare.network/ext/C/rpc"],
        },
    },
    blockExplorers: {
        default: {
            name: "Flare Explorer",
            url: "https://coston2.testnet.flarescan.com",
        },
    },
});