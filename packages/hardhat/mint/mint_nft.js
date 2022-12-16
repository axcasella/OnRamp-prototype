/* eslint-disable */
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
  "https://upload.wikimedia.org/wikipedia/commons/e/ea/Mauritius_Road_Signs_-_Warning_Sign_-_Other_dangers.svg";

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

const bannedWalletList = ["0x2eCB4dc5391Cf88B9bb2A8adbc643F9D3ED03c85"];

const isBannedWallet = (address) => {
  return bannedWalletList.includes(address);
};

// @param address - address to mint to
// @param country - country address resides in
const mintKYCBadgeNFT = async (address, country) => {
  let verified = true;
  let userVerified = true;
  let walletVerified = true;

  // validate country first
  if (isBannedCountry(country)) {
    userVerified = false;
    console.log("country is banned from doing business");
  }

  if (isBannedWallet(address)) {
    walletVerified = false;
    console.log("wallet is banned from doing business");
  }

  const amlValue = getRandomFromMinMax(5, 10); // AML value
  const credProtocolScore = getRandomFromMinMax(600, 1000); // Cred protocol score
  const isBusiness = false; // use false as default for prototype

  // if (amlValue < 7 || credProtocolScore < 700) verified = false;
  if (!walletVerified || !userVerified) verified = false;

  const kycBadge = {
    description: "KYC badge",
    external_url: "",
    image: verified ? verifiedBadgeImgURL : notVerifiedBadgeImgURL,
    name: "KYC Badge",
    attributes: [
      {
        trait_type: "AML",
        value: amlValue,
      },
      {
        trait_type: "CRED_PROTOCOL_SCORE",
        value: credProtocolScore,
      },
      {
        trait_type: "IS_BUSINESS",
        value: isBusiness ? "TRUE" : "FALSE",
      },
      {
        trait_type: "COUNTRY",
        value: country,
      },
      {
        trait_type: "DID",
        value: address,
      },
      {
        trait_type: "USER_STATUS",
        value: userVerified ? "TRUE" : "FALSE",
      },
      {
        trait_type: "WALLET_STATUS",
        value: walletVerified ? "TRUE" : "FALSE",
      },
    ],
  };

  return mintNFT(address, kycBadge, verified);
};

const mintNFT = async (address, item, verified) => {
  console.log("\n\n 🎫 Minting to " + address + "...\n");

  let uploaded = {};
  try {
    console.log("Uploading kycBadge for address", address);
    uploaded = await ipfs.add(JSON.stringify(item));
  } catch (err) {
    return {
      status: false,
      msg: "Failed to upload to IPFS: " + err,
      verified: verified,
    };
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
    return {
      status: false,
      msg: "Failed to mint to blockchain: " + err,
      verified: verified,
    };
  }

  // minted
  return { status: true, msg: "Successfully minted", verified: verified };

  // console.log("Transferring Ownership of YourCollectible to "+address+"...")
  // await yourCollectible.transferOwnership(address)
};

module.exports = { mintKYCBadgeNFT };
