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
// @param country - country address resides in
// @param amlValue -  AML value, between 1-10
// @param credProtocolScore - Cred protocol score,
// @param isBusiness - is this address a business
const mintKYCBadgeNFT = async (
  address,
  country,
  amlValue,
  credProtocolScore,
  isBusiness
) => {
  let badgeImgURL =
    "https://upload.wikimedia.org/wikipedia/commons/e/e4/Twitter_Verified_Badge.svg";
  // validate country first
  if (isBannedCountry(country)) {
    badgeImgURL =
      "https://upload.wikimedia.org/wikipedia/commons/3/3f/Warning_Icon_%28simple_colors%29.png";
    console.log("country is banned from doing business");
  }

  console.log("\n\n 🎫 Minting to " + address + "...\n");

  const { deployer } = await getNamedAccounts();
  console.log("\ndeployer: ", deployer);

  const yourCollectible = await ethers.getContract("YourCollectible", deployer);

  const kycApprovedBadge = {
    description: "KYC verified badge",
    external_url: "",
    image: badgeImgURL,
    name: "KYC Verified Badge",
    attributes: {
      AML: amlValue,
      DID: address,
      CRED_PROTOCOL_SCORE: credProtocolScore,
      IS_BUSINESS: isBusiness,
      COUNTRY: country,
    },
  };

  let uploaded = {};
  try {
    console.log("Uploading kycApprovedBadge for address", address);
    uploaded = await ipfs.add(JSON.stringify(kycApprovedBadge));
  } catch (err) {
    return { status: false, msg: "Failed to upload to IPFS: " + err };
  }

  try {
    console.log(
      "Minting kycApprovedBadge with IPFS hash (" + uploaded.path + ")"
    );
    const result = await yourCollectible.mintItem(address, uploaded.path, {
      gasLimit: 10000000,
    });
    console.log("Minted ", result);
  } catch (err) {
    return { status: false, msg: "Failed to mint to blockchain: " + err };
  }

  // minted
  return { status: true, msg: "Successfully minted" };

  // console.log("Transferring Ownership of YourCollectible to "+address+"...")
  // await yourCollectible.transferOwnership(address)
};

module.exports = { mintKYCBadgeNFT };
