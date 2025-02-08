import { ethers } from "hardhat";
import { expect } from "chai";
import { MarketplaceInstance } from "../typechain-types";
import { Signer } from "ethers";

describe("Marketplace", function () {
  let marketplace: MarketplaceInstance;
  let owner: Signer, seller: Signer, buyer: Signer, other: Signer;
  let sellerAddress: string, buyerAddress: string;
  let initialBalance: bigint;

  before(async function () {
    [owner, seller, buyer, other] = await ethers.getSigners();
    sellerAddress = await seller.getAddress();
    buyerAddress = await buyer.getAddress();
  });

  beforeEach(async function () {
    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy(["USD", "EUR", "GBP"]);
    await marketplace.waitForDeployment();
  });

  it("should deploy with accepted currencies", async function () {
    const currencies = await marketplace.acceptedCurrencies(0);
    expect(currencies).to.equal("USD");
  });

  it("should allow a seller to create an order", async function () {
    const price = 25050; // $250.50 in cents
    const amount = ethers.parseEther("1");

    await expect(
      marketplace.connect(seller).createOrder(price, "USD", { value: amount })
    )
      .to.emit(marketplace, "OrderCreated")
      .withArgs(0, sellerAddress);

    const order = await marketplace.getOrder(0);
    expect(order.status).to.equal(0); // OrderStatus.AVAILABLE
    expect(order.onChainSeller).to.equal(sellerAddress);
    expect(order.amount).to.equal(amount);
    expect(order.price).to.equal(price);
  });

//   it("should allow a buyer to accept an order", async function () {
//     const price = 25050;
//     const amount = ethers.parseEther("1");

//     await marketplace.connect(seller).createOrder(price, "USD", { value: amount });
//     await expect(marketplace.connect(buyer).acceptOrder(0))
//       .to.emit(marketplace, "OrderAccepted")
//       .withArgs(0, buyerAddress, (await ethers.provider.getBlock("latest")).timestamp + 86400);

//     const order = await marketplace.getOrder(0);
//     expect(order.status).to.equal(1); // OrderStatus.ACCEPTED
//     expect(order.offChainBuyer).to.equal(buyerAddress);
//   });

  it("should allow a seller to cancel an order", async function () {
    const price = 25050;
    const amount = ethers.parseEther("1");

    await marketplace.connect(seller).createOrder(price, "USD", { value: amount });

    await expect(marketplace.connect(seller).cancelOrder(0))
      .to.not.be.reverted;

    const order = await marketplace.getOrder(0);
    expect(order.status).to.equal(4); // OrderStatus.CANCELLED
  });

  it("should allow a buyer to claim tokens after payment", async function () {
    const price = 25050;
    const amount = ethers.parseEther("1");

    await marketplace.connect(seller).createOrder(price, "USD", { value: amount });
    await marketplace.connect(buyer).acceptOrder(0);

    // Mock the fiat payment recording (simulating backend verification)
    await marketplace.recordFiatPayment({
        data: { 
            attestationType: '0x494a736f6e417069000000000000000000000000000000000000000000000000',
            sourceId: '0x5745423200000000000000000000000000000000000000000000000000000000',
            votingRound: 895377,
            lowestUsedTimestamp: 0,
            requestBody: {
                url: 'https://pastes.io/download/sample-payments-webhook-response-1',
                postprocessJq: '. | .paidAmt = (.paidAmt * 100 | floor)',
                abi_signature: '{"components": [{"internalType": "uint256","name": "onChainOrderId","type": "uint256"},{"internalType": "address","name": "onChainSeller","type": "address"},{"internalType": "uint256","name": "paidAmt","type": "uint256"},{"internalType": "string","name": "paidCurrency","type": "string"},{"internalType": "uint256","name": "paidTimestamp","type": "uint256"},{"internalType": "string","name": "offChainReference","type": "string"}],"name": "payment","type": "tuple"}'
            },
            responseBody: {
                abi_encoded_data: ethers.AbiCoder.defaultAbiCoder().encode(
                    ["uint256", "address", "uint256", "string", "uint256", "string"],
                    [0, sellerAddress, price, "USD", Math.floor(Date.now() / 1000), "TX123"]
                ),
            },
        },
        merkleProof: [],
    });
    await expect(marketplace.connect(buyer).claimTokens(0))
      .to.emit(marketplace, "OrderCompleted")
      .withArgs(0);

    const order = await marketplace.getOrder(0);
    expect(order.status).to.equal(3); // OrderStatus.COMPLETED
  });

  it("should revert if an order is claimed without being paid", async function () {
    const price = 25050;
    const amount = ethers.parseEther("1");

    await marketplace.connect(seller).createOrder(price, "USD", { value: amount });
    await marketplace.connect(buyer).acceptOrder(0);

    await expect(marketplace.connect(buyer).claimTokens(0)).to.be.revertedWith("Order is not paid");
  });

  it("should purge expired orders", async function () {
    const price = 25050;
    const amount = ethers.parseEther("1");

    await marketplace.connect(seller).createOrder(price, "USD", { value: amount });
    await marketplace.connect(buyer).acceptOrder(0);

    // Simulate time passing beyond the deadline
    await ethers.provider.send("evm_increaseTime", [86401]);
    await ethers.provider.send("evm_mine", []);

    await marketplace.purgeExpired();

    const order = await marketplace.getOrder(0);
    expect(order.status).to.equal(0); // OrderStatus.AVAILABLE (reset)
  });
});