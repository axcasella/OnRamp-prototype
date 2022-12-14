import { INFURA_ID, INFURA_SECRET } from "../constants";
import { useContractReader } from "../hooks";
const { BufferList } = require("bl");
const ipfsAPI = require("ipfs-http-client");

const projectId = INFURA_ID;
const projectSecret = INFURA_SECRET;
const projectIdAndSecret = `${projectId}:${projectSecret}`;

const ipfs = ipfsAPI({
  host: "ipfs.infura.io",
  port: "5001",
  protocol: "https",
  headers: {
    authorization: `Basic ${Buffer.from(projectIdAndSecret).toString("base64")}`,
  },
});

// you usually go content.toString() after this...
const getFromIPFS = async hashToGet => {
  for await (const file of ipfs.get(hashToGet)) {
    if (!file.content) continue;
    const content = new BufferList();
    for await (const chunk of file.content) {
      content.append(chunk);
    }
    console.log(content);
    return content;
  }
};

export const getNFTAndMetaData = async (balance, readContracts, walletAddress) => {
  console.log("balance", balance);
  console.log("readContracts", readContracts);
  console.log("walletAddress", walletAddress);

  const result = [];
  for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
    try {
      const tokenId = await readContracts.YourCollectible.tokenOfOwnerByIndex(walletAddress, tokenIndex);
      console.log("tokenId", tokenId);

      const tokenURI = await readContracts.YourCollectible.tokenURI(tokenId);
      console.log("tokenURI", tokenURI);

      const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");
      console.log("ipfsHash", ipfsHash);

      const jsonManifestBuffer = await getFromIPFS(ipfsHash);

      try {
        const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
        console.log("jsonManifest", jsonManifest);
        const attributes = jsonManifest.attributes;
        // console.log("attributes", attributes);
        result.push({ id: tokenId, uri: tokenURI, owner: walletAddress, attributes, ...jsonManifest });
        // console.log("--tokenURI: ", tokenURI);
        return result;
      } catch (e) {
        console.log(e);
      }
    } catch (e) {
      console.log(e);
    }
  }
};
