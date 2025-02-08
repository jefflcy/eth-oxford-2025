import { MarketplaceContract, MarketplaceInstance } from '../typechain-types';

const MarketPlace: MarketplaceContract = artifacts.require("Marketplace");

describe('Marketplace', async () => {

    let marketplace: MarketplaceInstance

    beforeEach(async () => {
        marketplace = await MarketPlace.new(["USD", "EUR", "GBP"]);
    })

    it("Should be able to create order", async () => {
        const tx = await marketplace.createOrder("20", "USD", {
            value: 0.1*10**18
        })
        const receipt = await tx.wait()

    })

})