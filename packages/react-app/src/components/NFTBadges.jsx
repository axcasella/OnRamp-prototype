import React, { useState, useEffect } from "react";
import { Button, Card, List } from "antd";
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

export default function NFTBadges({ readContracts }) {
  const walletAddress = localStorage.getItem("walletAddress");

  console.log("readContracts NFT badge", readContracts);

  const balance = useContractReader(readContracts, "YourCollectible", "balanceOf", [walletAddress]);
  console.log("🤗 balance:", balance);

  const yourBalance = balance && balance.toNumber && balance.toNumber();

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
            console.log("jsonManifest", jsonManifest);
            collectibleUpdate.push({ id: tokenId, uri: tokenURI, owner: walletAddress, ...jsonManifest });
            console.log("--tokenURI: ", tokenURI);
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(e);
        }
      }
      setYourCollectibles(collectibleUpdate);
    };
    updateYourCollectibles();
  }, [walletAddress, yourBalance]);

  //   const [tableDataSrc, setTableDataSrc] = useState();
  //   const [loading, setLoading] = useState(true);

  //   const getMyConsentRequests = async () => {
  //     const response = await fetch(`http://localhost:8000/api/getConsentRequests/walletAddress/${walletAddress}`, {
  //       method: "GET",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     const data = await response.json();

  //     if (response.status === 200 && data) {
  //       setTableDataSrc(
  //         data.consentRequests.map(row => ({
  //           org: row,
  //           walletAddress,
  //           action: <Button type="primary">Give permission</Button>,
  //         })),
  //       );
  //       setLoading(false);
  //     } else {
  //       alert("Failed to get consent requests");
  //     }
  //   };

  //   const addConsent = async (address, org) => {
  //     const response = await fetch(`http://localhost:8000/api/addConsent`, {
  //       method: "POST",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         walletAddress: address,
  //         org,
  //       }),
  //     });

  //     const data = await response.json();

  //     if (data.status === "ok") {
  //       console.log("add consent success");
  //     } else {
  //       alert("Failed to add consent");
  //     }
  //   };

  //   useEffect(() => {
  //     getMyConsentRequests();
  //   }, [walletAddress]);

  //   const columns = [
  //     {
  //       title: "Requesting org",
  //       dataIndex: "org",
  //       key: "org",
  //       width: 200,
  //     },
  //     {
  //       title: "Action",
  //       dataIndex: "action",
  //       key: "action",
  //       width: 100,
  //       onCell: (record, rowIndex) => {
  //         return {
  //           onClick: () => {
  //             addConsent(record.walletAddress, record.org);
  //           },
  //         };
  //       },
  //     },
  //   ];

  // useEffect(() => {
  //     console.log("yourCollectibles", yourCollectibles);
  // }, [])

  return (
    <div style={{ width: 640, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <List
        bordered
        dataSource={yourCollectibles}
        renderItem={item => {
          const id = item.id.toNumber();
          return (
            <List.Item key={id + "_" + item.uri + "_" + item.owner}>
              <Card
                title={
                  <div>
                    <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                  </div>
                }
              >
                <div>
                  <img src={item.image} style={{ maxWidth: 150 }} alt="NFT badge" />
                </div>
                <div>{item.description}</div>
              </Card>

              <div>
                owner: <span>{item.owner}</span>
              </div>
            </List.Item>
          );
        }}
      />
    </div>
  );
}
