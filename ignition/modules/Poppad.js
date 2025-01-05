const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers } = require("hardhat");

const FEE = ethers.parseUnits("0.01", 18)

module.exports = buildModule("PoppadModule", (m) => {
    const fee = m.getParameter("fee", FEE)

    // Deploy with only the constructor argument
    const poppad = m.contract("Poppad", [fee]);

    return { poppad };
});