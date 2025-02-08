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



## License

This project is licensed under the MIT License.
