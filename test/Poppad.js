const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Poppad", function () {
  // Poppad contract variables
  const FEE = ethers.parseUnits("0.01", 18)

  async function deployPoppadFixture() {
    // Get accounts
    const [deployer, creator, buyer] = await ethers.getSigners()

    // Deploy poppad
    const Poppad = await ethers.getContractFactory("Poppad")
    const poppad = await Poppad.deploy(FEE)

    // Create token
    const transaction = await poppad.connect(creator).create("DAPP Uni", "DAPP", { value: FEE })
    await transaction.wait()

    // Get token address
    const tokenAddress = await poppad.tokens(0)
    const token = await ethers.getContractAt("Token", tokenAddress)

    // Return values
    return { poppad, token, deployer, creator, buyer }
  }

  async function buyTokenFixture() {
    const { poppad, token, creator, buyer } = await deployPoppadFixture()

    const AMOUNT = ethers.parseUnits("10000", 18)
    const COST = ethers.parseUnits("1", 18)

    // Buy tokens
    const transaction = await poppad.connect(buyer).buy(await token.getAddress(), AMOUNT, { value: COST })
    await transaction.wait()

    return { poppad, token, creator, buyer }
  }

  describe("Deployment", function () {
    it("Should set the fee", async function () {
      const { poppad } = await loadFixture(deployPoppadFixture)
      expect(await poppad.fee()).to.equal(FEE)
    })

    it("Should set the owner", async function () {
      const { poppad, deployer } = await loadFixture(deployPoppadFixture)
      expect(await poppad.owner()).to.equal(deployer.address)
    })
  })

  describe("Creating", function () {
    it("Should set the owner", async function () {
      const { poppad, token } = await loadFixture(deployPoppadFixture)
      expect(await token.owner()).to.equal(await poppad.getAddress())
    })

    it("Should set the creator", async function () {
      const { token, creator } = await loadFixture(deployPoppadFixture)
      expect(await token.creator()).to.equal(creator.address)
    })

    it("Should set the supply", async function () {
      const { poppad, token } = await loadFixture(deployPoppadFixture)

      const totalSupply = ethers.parseUnits("1000000", 18)

      expect(await token.balanceOf(await poppad.getAddress())).to.equal(totalSupply)
    })

    it("Should update ETH balance", async function () {
      const { poppad } = await loadFixture(deployPoppadFixture)

      const balance = await ethers.provider.getBalance(await poppad.getAddress())

      expect(balance).to.equal(FEE)
    })

    it("Should create the sale", async function () {
      const { poppad, token, creator } = await loadFixture(deployPoppadFixture)

      const count = await poppad.totalTokens()
      expect(count).to.equal(1)

      const sale = await poppad.getTokenSale(0)

      expect(sale.token).to.equal(await token.getAddress())
      expect(sale.creator).to.equal(creator.address)
      expect(sale.sold).to.equal(0)
      expect(sale.raised).to.equal(0)
      expect(sale.isOpen).to.equal(true)
    })
  })

  describe("Buying", function () {
    const AMOUNT = ethers.parseUnits("10000", 18)
    const COST = ethers.parseUnits("1", 18)

    it("Should update ETH balance", async function () {
      const { poppad } = await loadFixture(buyTokenFixture)

      const balance = await ethers.provider.getBalance(await poppad.getAddress())

      // Remember the fee to initially create the token + someone who bought
      expect(balance).to.equal(FEE + COST)
    })

    it("Should update token balances", async function () {
      const { token, buyer } = await loadFixture(buyTokenFixture)

      const balance = await token.balanceOf(buyer.address)

      expect(balance).to.equal(AMOUNT)
    })

    it("Should update token sale", async function () {
      const { poppad, token } = await loadFixture(buyTokenFixture)

      const sale = await poppad.tokenToSale(await token.getAddress())

      expect(sale.sold).to.equal(AMOUNT)
      expect(sale.raised).to.equal(COST)
      expect(sale.isOpen).to.equal(true)
    })

    it("Should increase base cost", async function () {
      const { poppad, token } = await loadFixture(buyTokenFixture)

      const sale = await poppad.tokenToSale(await token.getAddress())
      const cost = await poppad.getCost(sale.sold)

      expect(cost).to.be.equal(ethers.parseUnits("0.0002"))
    })
  })

  describe("Depositing", function () {
    const AMOUNT = ethers.parseUnits("10000", 18)
    const COST = ethers.parseUnits("2", 18)

    it("Sale should be closed and successfully deposits", async function () {
      const { poppad, token, creator, buyer } = await loadFixture(buyTokenFixture)

      // Buy tokens again to reach target
      const buyTx = await poppad.connect(buyer).buy(await token.getAddress(), AMOUNT, { value: COST })
      await buyTx.wait()

      const sale = await poppad.tokenToSale(await token.getAddress())
      expect(sale.isOpen).to.equal(false)

      const depositTx = await poppad.connect(creator).deposit(await token.getAddress())
      await depositTx.wait()

      const balance = await token.balanceOf(creator.address)
      expect(balance).to.equal(ethers.parseUnits("980000", 18))
    })
  })

  describe("Withdrawing Fees", function () {
    it("Should update ETH balances", async function () {
      const { poppad, deployer } = await loadFixture(deployPoppadFixture)

      const transaction = await poppad.connect(deployer).withdraw(FEE)
      await transaction.wait()

      const balance = await ethers.provider.getBalance(await poppad.getAddress())

      expect(balance).to.equal(0)
    })
  })
})