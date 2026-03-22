import { ethers } from "hardhat";
import { expect } from "chai";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
// import { OperaFi } from "../contracts/OperaFi.sol";
import { OperaFi } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
describe("OperaFi", function () {
  let token: OperaFi;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  const MAX_SUPPLY = ethers.parseEther("10000000"); // 10M
  const FAUCET_AMOUNT = ethers.parseEther("100");
  const COOLDOWN = 24 * 60 * 60;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const TokenFactory = await ethers.getContractFactory("OperaFi");
    // token = await TokenFactory.deploy(owner.address);
    token = (await TokenFactory.deploy(owner.address)) as OperaFi;
    await token.waitForDeployment();
  });

  //  DEPLOYMENT TEST
  describe("Deployment", function () {
    it("should set correct name and symbol", async function () {
      expect(await token.name()).to.equal("Opera Finance");
      expect(await token.symbol()).to.equal("OFI");
    });

    it("should set MAX_SUPPLY correctly", async function () {
      expect(await token.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
    });

    it("should mint initial supply to owner", async function () {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(ownerBalance).to.equal(ethers.parseEther("100"));
    });

    it("should set correct owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });
  });

  // FAUCET
  describe("requestToken()", function () {
    it("should mint tokens to user", async function () {
      await token.connect(user1).requestToken();
      expect(await token.balanceOf(user1.address)).to.equal(FAUCET_AMOUNT);
    });

    it("should record lastClaimTime", async function () {
      await token.connect(user1).requestToken();
      const lastRequest = await token.lastClaimTime(user1.address);
      expect(lastRequest).to.be.gt(0);
    });

    it("should emit TokensRequested event", async function () {
      await expect(token.connect(user1).requestToken())
        .to.emit(token, "TokensRequested")
        .withArgs(user1.address, FAUCET_AMOUNT, anyValue);
    });

    it("should revert if called before 24h", async function () {
      await token.connect(user1).requestToken();

      await expect(token.connect(user1).requestToken()).to.be.revertedWith(
        "Cooldown active",
      );
    });

    it("should revert requestToken if MAX_SUPPLY exceeded", async function () {
      const remaining = await token.remainingSupply();

      await token.connect(owner).mint(owner.address, remaining);

      await expect(token.connect(user1).requestToken()).to.be.revertedWith(
        "Max supply reached",
      );
    });

    it("should return 0 after cooldown passes", async function () {
      await token.connect(user1).requestToken();
      await time.increase(COOLDOWN);

      const remaining = await token.getUntilNextRequestTime(user1.address);
      expect(remaining).to.equal(0n);
    });

    it("should allow request after 24h", async function () {
      await token.connect(user1).requestToken();
      await time.increase(COOLDOWN);

      await token.connect(user1).requestToken();

      expect(await token.balanceOf(user1.address)).to.equal(FAUCET_AMOUNT * 2n);
    });

    it("should not affect other users", async function () {
      await token.connect(user1).requestToken();
      await token.connect(user2).requestToken();

      expect(await token.balanceOf(user1.address)).to.equal(FAUCET_AMOUNT);
      expect(await token.balanceOf(user2.address)).to.equal(FAUCET_AMOUNT);
    });

    it("should increase totalSupply", async function () {
      const before = await token.totalSupply();
      await token.connect(user1).requestToken();
      const after = await token.totalSupply();

      expect(after - before).to.equal(FAUCET_AMOUNT);
    });
  });

  // MINT
  describe("mint()", function () {
    it("should allow owner to mint", async function () {
      const amount = ethers.parseEther("500");
      await token.connect(owner).mint(user1.address, amount);

      expect(await token.balanceOf(user1.address)).to.equal(amount);
    });
    it("should allow mint up to MAX_SUPPLY exactly", async function () {
      const remaining = await token.remainingSupply();

      await token.connect(owner).mint(user1.address, remaining);

      expect(await token.totalSupply()).to.equal(MAX_SUPPLY);
    });

    it("should emit TokenMinted event", async function () {
      const amount = ethers.parseEther("500");

      await expect(token.connect(owner).mint(user1.address, amount))
        .to.emit(token, "TokenMinted")
        .withArgs(user1.address, amount);
    });

    it("should revert if non-owner mints", async function () {
      const amount = ethers.parseEther("500");

      await expect(
        token.connect(user1).mint(user1.address, amount),
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("should revert if exceeding MAX_SUPPLY", async function () {
      await expect(
        token.connect(owner).mint(user1.address, MAX_SUPPLY),
      ).to.be.revertedWith("Maximum supply reached");
    });

    it("should revert if zero address", async function () {
      await expect(
        token.connect(owner).mint(ethers.ZeroAddress, ethers.parseEther("1")),
      ).to.be.revertedWith("Cannot mint to address zero");
    });

    it("should revert if amount is zero", async function () {
      await expect(
        token.connect(owner).mint(user1.address, 0),
      ).to.be.revertedWith("Amount must be greater than zero");
    });
  });

  // VIEW FUNCTIONS
  describe("View functions", function () {
    it("canRequestTokens should return true initially", async function () {
      expect(await token.canRequestTokens(user1.address)).to.equal(true);
    });

    it("should return false immediately after request", async function () {
      await token.connect(user1).requestToken();
      expect(await token.canRequestTokens(user1.address)).to.equal(false);
    });

    it("should return true after cooldown", async function () {
      await token.connect(user1).requestToken();
      await time.increase(COOLDOWN);

      expect(await token.canRequestTokens(user1.address)).to.equal(true);
    });

    it("getUntilNextRequestTime should return 0 initially", async function () {
      expect(await token.getUntilNextRequestTime(user1.address)).to.equal(0n);
    });

    it("should return remaining time after request", async function () {
      await token.connect(user1).requestToken();

      const remaining = await token.getUntilNextRequestTime(user1.address);

      expect(remaining).to.be.closeTo(BigInt(COOLDOWN), 5n);
    });

    it("remainingSupply should decrease after mint", async function () {
      const before = await token.remainingSupply();
      await token.connect(user1).requestToken();
      const after = await token.remainingSupply();

      expect(before - after).to.equal(FAUCET_AMOUNT);
    });
  });
});
