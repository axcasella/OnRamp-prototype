import React, { useState, useEffect } from "react";
import { Table } from "antd";
import { getNFTAndMetaData } from "../helpers/metadata";
import { useContractReader } from "../hooks";

export default function EndUserNFTBadges({ readContracts, walletAddress }) {
  const [tableDataSrc, setTableDataSrc] = useState();
  const [loading, setLoading] = useState(true);

  const balance = useContractReader(readContracts, "YourCollectible", "balanceOf", [walletAddress]);

  const [myNFTs, setMyNFTs] = useState();
  useEffect(() => {
    if (!myNFTs) {
      const getData = async () => {
        const nfts = await getNFTAndMetaData(balance, readContracts, walletAddress);
        setMyNFTs(nfts);
        console.log("nfts", nfts);
        setTableDataSrc(
          // attributes [AML, CRED_PROTOCOL_SCORE, IS_BUSINESS, COUNTRY, DID, USER_STATUS, WALLET_STATUS]
          nfts &&
            nfts.map(row => ({
            aml: row.attributes[0].value,
            cred: row.attributes[1].value,
            business: row.attributes[2].value === "TRUE" ? "Yes" : "No",
            country: row.attributes[3].value,
            address: row.attributes[4].value,
            badges: <img src={row.image} style={{ maxWidth: 50 }} alt="NFT badge" />,
          })),
        );
        setLoading(false);
      };
      getData();
    }
  }, [balance]);

  const columns = [
    {
      title: "Wallet address",
      dataIndex: "address",
      key: "org",
      width: 225,
    },
    {
      title: "AML Score",
      dataIndex: "aml",
      key: "aml",
      width: 100,
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
      width: 125,
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
