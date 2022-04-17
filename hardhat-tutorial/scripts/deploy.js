const { ethers } = require("hardhat");

async function main() {
    const whitelistContract = await ethers.getContractFactory("Whitelist");

    // Deploy the contract
    // 10 is the max num of addies allowed in whitelist.
    const deployedWhitelistContract = await whitelistContract.deploy(10);

    await deployedWhitelistContract.deployed();

    // print addy of deployed contract
    console.log(
        "Whitelist Contract Address:", deployedWhitelistContract
    );
}

// Call the main() function and catch if there is any error.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
