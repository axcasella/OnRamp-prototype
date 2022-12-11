/* eslint no-use-before-define: "warn" */
const { INFURA_ID, INFURA_SECRET } = require("../constants.js");
const { ethers, getNamedAccounts } = require("hardhat");
const ipfsAPI = require("ipfs-http-client");
const { getRandomFromMinMax } = require("../server/helper/utils.js");

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

const verifiedBadgeImgURL =
  "https://upload.wikimedia.org/wikipedia/commons/e/e4/Twitter_Verified_Badge.svg";

const notVerifiedBadgeImgURL =
  "https://upload.wikimedia.org/wikipedia/commons/3/3f/Warning_Icon_%28simple_colors%29.png";

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
const mintKYCBadgeNFT = async (address, country) => {
  let verified = true;

  // validate country first
  if (isBannedCountry(country)) {
    verified = false;
    console.log("country is banned from doing business");
  }

  const amlValue = getRandomFromMinMax(6, 10); // AML value
  const credProtocolScore = getRandomFromMinMax(600, 1000); // Cred protocol score
  const isBusiness = false; // use false as default for prototype

  // if (amlValue < 7 || credProtocolScore < 700) verified = false;

  const kycBadge = {
    description: "KYC badge",
    external_url: "",
    image: verified ? verifiedBadgeImgURL : notVerifiedBadgeImgURL,
    name: "KYC Badge",
    verified,
    attributes: {
      AML: amlValue,
      DID: address,
      CRED_PROTOCOL_SCORE: credProtocolScore,
      IS_BUSINESS: isBusiness,
      COUNTRY: country,
    },
  };

  return mintNFT(address, kycBadge);
};

const mintNFT = async (address, item) => {
  console.log("\n\n 🎫 Minting to " + address + "...\n");

  let uploaded = {};
  try {
    console.log("Uploading kycBadge for address", address);
    uploaded = await ipfs.add(JSON.stringify(item));
  } catch (err) {
    return { status: false, msg: "Failed to upload to IPFS: " + err };
  }

  try {
    console.log("Minting kycBadge with IPFS hash (" + uploaded.path + ")");

    const { deployer } = await getNamedAccounts();
    console.log("\ndeployer: ", deployer);

    const yourCollectible = await ethers.getContract(
      "YourCollectible",
      deployer
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
