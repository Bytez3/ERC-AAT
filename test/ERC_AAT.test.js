const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC-AAT", function () {
  let ERC_AAT;
  let ercAAT;
  let owner;
  let user1;
  let user2;
  let user3;
  let addrs;

  beforeEach(async function () {
    [owner, user1, user2, user3, ...addrs] = await ethers.getSigners();
    
    ERC_AAT = await ethers.getContractFactory("ERC_AAT");
    ercAAT = await ERC_AAT.deploy(owner.address);
    await ercAAT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await ercAAT.owner()).to.equal(owner.address);
    });
  });

  describe("Achievement URI Management", function () {
    it("Should allow owner to set achievement URI", async function () {
      const achievementId = 1;
      const uri = "ipfs://QmTest123";
      
      await ercAAT.setAchievementURI(achievementId, uri);
      expect(await ercAAT.achievementURI(achievementId)).to.equal(uri);
    });

    it("Should not allow non-owner to set achievement URI", async function () {
      const achievementId = 1;
      const uri = "ipfs://QmTest123";
      
      await expect(
        ercAAT.connect(user1).setAchievementURI(achievementId, uri)
      ).to.be.revertedWithCustomError(ercAAT, "OwnableUnauthorizedAccount");
    });

    it("Should not allow setting empty URI", async function () {
      const achievementId = 1;
      const uri = "";
      
      await expect(
        ercAAT.setAchievementURI(achievementId, uri)
      ).to.be.revertedWith("ERC-AAT: URI cannot be empty");
    });
  });

  describe("Achievement Minting", function () {
    beforeEach(async function () {
      await ercAAT.setAchievementURI(1, "ipfs://QmTest1");
      await ercAAT.setAchievementURI(2, "ipfs://QmTest2");
    });

    it("Should allow owner to mint achievement", async function () {
      await ercAAT.mintAchievement(user1.address, 1);
      expect(await ercAAT.hasAchievement(user1.address, 1)).to.be.true;
    });

    it("Should not allow non-owner to mint achievement", async function () {
      await expect(
        ercAAT.connect(user1).mintAchievement(user2.address, 1)
      ).to.be.revertedWithCustomError(ercAAT, "OwnableUnauthorizedAccount");
    });

    it("Should not allow minting to zero address", async function () {
      await expect(
        ercAAT.mintAchievement(ethers.ZeroAddress, 1)
      ).to.be.revertedWith("ERC-AAT: Cannot mint to zero address");
    });

    it("Should not allow minting non-existent achievement", async function () {
      await expect(
        ercAAT.mintAchievement(user1.address, 999)
      ).to.be.revertedWith("ERC-AAT: Achievement does not exist");
    });

    it("Should not allow minting same achievement twice", async function () {
      await ercAAT.mintAchievement(user1.address, 1);
      
      await expect(
        ercAAT.mintAchievement(user1.address, 1)
      ).to.be.revertedWith("ERC-AAT: Achievement already unlocked");
    });

    it("Should emit AchievementUnlocked event", async function () {
      const tx = await ercAAT.mintAchievement(user1.address, 1);
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "AchievementUnlocked"
      );
      expect(event).to.not.be.undefined;
      expect(event.args.achiever).to.equal(user1.address);
      expect(event.args.achievementId).to.equal(1);
    });

    it("Should increment user achievement count", async function () {
      expect(await ercAAT.getUserAchievementCount(user1.address)).to.equal(0);
      
      await ercAAT.mintAchievement(user1.address, 1);
      expect(await ercAAT.getUserAchievementCount(user1.address)).to.equal(1);
      
      await ercAAT.mintAchievement(user1.address, 2);
      expect(await ercAAT.getUserAchievementCount(user1.address)).to.equal(2);
    });

    it("Should increment achievement earned count", async function () {
      expect(await ercAAT.getAchievementEarnedCount(1)).to.equal(0);
      
      await ercAAT.mintAchievement(user1.address, 1);
      expect(await ercAAT.getAchievementEarnedCount(1)).to.equal(1);
      
      await ercAAT.mintAchievement(user2.address, 1);
      expect(await ercAAT.getAchievementEarnedCount(1)).to.equal(2);
    });
  });

  describe("Batch Achievement Minting", function () {
    beforeEach(async function () {
      await ercAAT.setAchievementURI(1, "ipfs://QmTest1");
    });

    it("Should allow owner to batch mint achievements", async function () {
      const achievers = [user1.address, user2.address, user3.address];
      
      await ercAAT.batchMintAchievement(achievers, 1);
      
      expect(await ercAAT.hasAchievement(user1.address, 1)).to.be.true;
      expect(await ercAAT.hasAchievement(user2.address, 1)).to.be.true;
      expect(await ercAAT.hasAchievement(user3.address, 1)).to.be.true;
    });

    it("Should not allow non-owner to batch mint", async function () {
      const achievers = [user1.address, user2.address];
      
      await expect(
        ercAAT.connect(user1).batchMintAchievement(achievers, 1)
      ).to.be.revertedWithCustomError(ercAAT, "OwnableUnauthorizedAccount");
    });

    it("Should not allow batch minting non-existent achievement", async function () {
      const achievers = [user1.address, user2.address];
      
      await expect(
        ercAAT.batchMintAchievement(achievers, 999)
      ).to.be.revertedWith("ERC-AAT: Achievement does not exist");
    });

    it("Should not allow empty achievers array", async function () {
      await expect(
        ercAAT.batchMintAchievement([], 1)
      ).to.be.revertedWith("ERC-AAT: Empty achievers array");
    });

    it("Should not allow too many achievers in batch", async function () {
      const achievers = Array(101).fill(user1.address);
      
      await expect(
        ercAAT.batchMintAchievement(achievers, 1)
      ).to.be.revertedWith("ERC-AAT: Too many achievers in batch");
    });

    it("Should skip already achieved users in batch", async function () {
      await ercAAT.mintAchievement(user1.address, 1);
      
      const achievers = [user1.address, user2.address];
      await ercAAT.batchMintAchievement(achievers, 1);
      
      expect(await ercAAT.getAchievementEarnedCount(1)).to.equal(2);
    });

    it("Should skip zero addresses in batch", async function () {
      const achievers = [user1.address, ethers.ZeroAddress, user2.address];
      await ercAAT.batchMintAchievement(achievers, 1);
      
      expect(await ercAAT.hasAchievement(user1.address, 1)).to.be.true;
      expect(await ercAAT.hasAchievement(user2.address, 1)).to.be.true;
      expect(await ercAAT.getAchievementEarnedCount(1)).to.equal(2);
    });
  });

  describe("Achievement Queries", function () {
    beforeEach(async function () {
      await ercAAT.setAchievementURI(1, "ipfs://QmTest1");
      await ercAAT.mintAchievement(user1.address, 1);
    });

    it("Should correctly check if user has achievement", async function () {
      expect(await ercAAT.hasAchievement(user1.address, 1)).to.be.true;
      expect(await ercAAT.hasAchievement(user2.address, 1)).to.be.false;
    });

    it("Should return correct achievement URI", async function () {
      expect(await ercAAT.achievementURI(1)).to.equal("ipfs://QmTest1");
    });

    it("Should return empty string for non-existent achievement", async function () {
      expect(await ercAAT.achievementURI(999)).to.equal("");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle multiple achievements per user", async function () {
      await ercAAT.setAchievementURI(1, "ipfs://QmTest1");
      await ercAAT.setAchievementURI(2, "ipfs://QmTest2");
      await ercAAT.setAchievementURI(3, "ipfs://QmTest3");
      
      await ercAAT.mintAchievement(user1.address, 1);
      await ercAAT.mintAchievement(user1.address, 2);
      await ercAAT.mintAchievement(user1.address, 3);
      
      expect(await ercAAT.getUserAchievementCount(user1.address)).to.equal(3);
      expect(await ercAAT.hasAchievement(user1.address, 1)).to.be.true;
      expect(await ercAAT.hasAchievement(user1.address, 2)).to.be.true;
      expect(await ercAAT.hasAchievement(user1.address, 3)).to.be.true;
    });

    it("Should handle multiple users per achievement", async function () {
      await ercAAT.setAchievementURI(1, "ipfs://QmTest1");
      
      await ercAAT.mintAchievement(user1.address, 1);
      await ercAAT.mintAchievement(user2.address, 1);
      await ercAAT.mintAchievement(user3.address, 1);
      
      expect(await ercAAT.getAchievementEarnedCount(1)).to.equal(3);
    });
  });
});

// Helper function to get current block timestamp
async function time() {
  const blockNum = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNum);
  return block.timestamp;
} 