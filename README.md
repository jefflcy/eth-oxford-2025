# FlareGate - P2P Crypto On/Off Ramp

This project is a decentralized peer-to-peer (P2P) platform for buying and selling cryptocurrency using fiat currencies. It leverages on [Flare Networks's FDC](https://dev.flare.network/fdc/overview/) for offchain Web2 data confirmation and has potential integration with open banking APIs.

## Project Structure

- **Frontend**: Located in the `/flaregate` directory, built with [Next.js](https://nextjs.org).
- **Smart Contracts**: Located in the `/contracts` directory, developed using [Hardhat](https://hardhat.org).

## User flow

- **Order Creation**: Sellers `createOrder` onchain to sell crypto.
- **Order Acceptance**: Buyers `acceptOrder` and pay in fiat (within a 1 day deadline).
- **Fiat Payment Recording**: Backend records fiat payments through attested proofs.
- **Token Claiming**: Buyers claimTokens once payment is verified.
- **Order Management**: Sellers can `cancelOrder` while Backend will periodically `purgeExpired` orders.

## Getting Started

### Frontend

Navigate to the `/flaregate` directory and run the development server:

```bash
cd flaregate
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Smart Contracts

Navigate to the `/contracts` directory to compile, test and deploy the smart contracts using Hardhat:

Refer to `.env.example` for required env variables for deploymeny on `Coston2`.

```bash
cd contracts
yarn hardhat compile
yarn hardhat test
yarn hardhat run scripts/deploy.ts
```

## Our experience building on Flare
- Filip was of great help especially when we wanted to use web2 APIs with FDC using Jq
- [FDC Workflow overview](https://dev.flare.network/fdc/overview) was confusing when reading for the first time (not sure what the link was between user, smart contract and data provider)
- Main documentation mentioned using Web2 APIs but no example or attestation type for it which made it confusing at the start, so we made mock EVMTransactions to do the attestations
- Explored options with Filip more and he englightened us about Jq, and even shared the same vision as us with regards to using open banking APIs and private APIs (using an access token)
- It would be useful to deploy and upkeep a deployed contracts list page for all 4 networks
- API also had changes at the start of the hackathon (DA API from v0 to v1), so it would be cool if there was a mass notification on telegram for example
- Starter kits were very helpful


## License

This project is licensed under the MIT License.
