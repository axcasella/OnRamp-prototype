/* eslint no-use-before-define: "warn" */
import { INFURA_ID, INFURA_SECRET } from "../../react-app/src/constants";

// import ethers from "hardhat";
const { ethers } = require("hardhat");
const ipfsAPI = require("ipfs-http-client");

const projectId = INFURA_ID;
const projectSecret = INFURA_SECRET;
const projectIdAndSecret = `${projectId}:${projectSecret}`;

const ipfs = ipfsAPI({
  host: "ipfs.infura.io",
  port: "5001",
  protocol: "https",
  headers: {
    authorization: `Basic ${Buffer.from(projectIdAndSecret).toString(
      "base64"
    )}`,
  },
});

// @param address - address to mint to
// @param metadata - data that will be on IPFS
const mintKYCBadgeNFT = async (address) => {
  console.log("\n\n 🎫 Minting to " + address + "...\n");

  const { deployer } = await getNamedAccounts();
  console.log("\ndeployer: ", deployer);

  const yourCollectible = await ethers.getContract("YourCollectible", deployer);

  const kycApprovedBadge = {
    description: "KYC verified badge",
    external_url: "",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/e4/Twitter_Verified_Badge.svg",
    name: "KYC Verified Badge",
    attributes: [
      {
        trait_type: "dmv",
        value: "compliant",
      },
      {
        trait_type: "gov",
        value: "compliant",
      },
    ],
  };
  console.log("Uploading kycApprovedBadge for address", address);
  const uploaded = await ipfs.add(JSON.stringify(kycApprovedBadge));

  console.log(
    "Minting kycApprovedBadge with IPFS hash (" + uploaded.path + ")"
  );
  await yourCollectible.mintItem(address, uploaded.path, {
    gasLimit: 10000000,
  });

  // console.log("Transferring Ownership of YourCollectible to "+address+"...")
  // await yourCollectible.transferOwnership(address)
};

module.exports = { mintKYCBadgeNFT };

// mintKYCBadgeNFT()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
