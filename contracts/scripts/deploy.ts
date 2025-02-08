import "@nomicfoundation/hardhat-verify";
import { artifacts, ethers, run } from 'hardhat';
import { MarketplaceContract } from '../typechain-types'
const Marketplace: MarketplaceContract = artifacts.require('Marketplace');


async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const args: any[] = [["USD", "EUR", "GBP"]];
    const marketplace = await Marketplace.new(...args);
    console.log("Marketplace contract deployed to:", marketplace.address);
    try {

        const result = await run("verify:verify", {
            address: marketplace.address,
            // address: "0x2D765DE0d3B3fEa923140CaD379bA85E9D7991DF",
            constructorArguments: args,
        })

        console.log('@@@@@@@@@@@@@@@@@@@@@@@@ result:', result);
    } catch (e: any) {
        console.log(e.message)
    }
    console.log("Deployed contract at:", marketplace.address)

}
main().then(() => process.exit(0))