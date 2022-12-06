/* eslint no-use-before-define: "warn" */
const { INFURA_ID, INFURA_SECRET } = require("../constants.js");
const { ethers, getNamedAccounts } = require("hardhat");
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

const OFACCountryList = [
  "Belarus",
  "Cuba",
  "DR Congo",
  "Iran",
  "Iraq",
  "Ivory Coast",
  "Liberia",
  "Myanmar",
  "North Korea",
  "Sudan",
  "Syria",
  "Zimbabwe",
  "Russia", // Russia is not in this list originally
];

const isBannedCountry = (country) => {
  return OFACCountryList.includes(country);
};

// @param address - address to mint to
// @param metadata - data that will be on IPFS
const mintKYCBadgeNFT = async (address, country) => {
  // validate country first
  if (isBannedCountry(country)) {
    return { status: false, msg: "Country is banned from doing business" };
  }

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
        type: "AML",
        value: "8",
      },
      {
        type: "DID",
        value: address,
      },
      {
        type: "CRED_PROTOCOL_SCORE",
        value: "700",
      },
      {
        type: "IS_BUSINESS",
        value: "false",
      },
      {
        type: "COUNTRY",
        value: country,
      },
    ],
  };

  let uploaded = {};
  try {
    console.log("Uploading kycApprovedBadge for address", address);
    uploaded = await ipfs.add(JSON.stringify(kycApprovedBadge));
  } catch (err) {
    return { status: false, msg: "Failed to upload to IPFS: " + err };
  }

  console.log("uploaded", uploaded);

  try {
    console.log(
      "Minting kycApprovedBadge with IPFS hash (" + uploaded.path + ")"
    );
    let tokenID = await yourCollectible.mintItem(address, uploaded.path, {
      gasLimit: 10000000,
    });
    console.log("tokenID", tokenID);
  } catch (err) {
    return { status: false, msg: "Failed to mint to blockchain: " + err };
  }

  // minted
  return { status: true, msg: "Successfully minted" };

  // console.log("Transferring Ownership of YourCollectible to "+address+"...")
  // await yourCollectible.transferOwnership(address)
};

module.exports = { mintKYCBadgeNFT };
