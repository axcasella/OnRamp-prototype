import React, { useState, useEffect } from "react";
import { Button, Card, List, Table } from "antd";
import { useContractReader } from "../hooks";
import { INFURA_ID, INFURA_SECRET } from "../constants";

const { ethers } = require("ethers");
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

export default function NFTBadges({ readContracts, walletAddress }) {
  console.log("walletAddress", walletAddress);

  const [tableDataSrc, setTableDataSrc] = useState();
  const [loading, setLoading] = useState(true);

  console.log("readContracts NFT badge", readContracts);

  const balance = useContractReader(readContracts, "YourCollectible", "balanceOf", [walletAddress]);
  console.log("🤗 balance:", balance);

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

  const [yourCollectibles, setYourCollectibles] = useState();
  useEffect(() => {
    console.log("balance", balance);
    const updateYourCollectibles = async () => {
      const collectibleUpdate = [];
      for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
        try {
          console.log("iteration", tokenIndex);
          const tokenId = await readContracts.YourCollectible.tokenOfOwnerByIndex(walletAddress, tokenIndex);
          const tokenURI = await readContracts.YourCollectible.tokenURI(tokenId);
          const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");

          const jsonManifestBuffer = await getFromIPFS(ipfsHash);

          try {
            const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
            // console.log("jsonManifest", jsonManifest);
            const attributes = jsonManifest.attributes;
            // console.log("attributes", attributes);
            collectibleUpdate.push({ id: tokenId, uri: tokenURI, owner: walletAddress, attributes, ...jsonManifest });
            // console.log("--tokenURI: ", tokenURI);
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(e);
        }
      }
      setYourCollectibles(collectibleUpdate);
      console.log("collectibleUpdate", collectibleUpdate);
      setTableDataSrc(
        // attributes [AML, CRED_PROTOCOL_SCORE, IS_BUSINESS, COUNTRY, DID, VERIFIED]
        collectibleUpdate.map(row => ({
          aml: row.attributes[0].value,
          cred: row.attributes[1].value,
          business: row.attributes[2].value === "TRUE" ? "Yes" : "No",
          country: row.attributes[3].value,
          address: row.attributes[4].value,
          verified: row.attributes[5].value === "TRUE" ? "Passed" : "Failed",
          badges: <img src={row.image} style={{ maxWidth: 50 }} alt="NFT badge" />,
        })),
      );
      setLoading(false);
    };
    updateYourCollectibles();
  }, [balance]);

  const columns = [
    {
      title: "Wallet address",
      dataIndex: "address",
      key: "org",
      width: 250,
    },
    {
      title: "Verified",
      dataIndex: "verified",
      key: "verified",
      width: 50,
    },
    {
      title: "AML Score",
      dataIndex: "aml",
      key: "aml",
      width: 150,
    },
    {
      title: "Credit Protocol Score",
      dataIndex: "cred",
      key: "cred",
      width: 150,
    },
    {
      title: "Business Account",
      dataIndex: "business",
      key: "business",
      width: 100,
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      width: 100,
    },
    {
      title: "Badges",
      dataIndex: "badges",
      key: "badges",
      width: 50,
    },
  ];

  return (
    <div style={{ width: 1200, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <div>
          {loading ? (
            "No users found"
          ) : (
            <div>
              <Table columns={columns} dataSource={tableDataSrc} />
            </div>
        )}
      </div>
    </div>
  );
}
