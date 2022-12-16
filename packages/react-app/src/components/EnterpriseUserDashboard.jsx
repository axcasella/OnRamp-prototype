import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Table, Button } from "antd";
import jwt from "jsonwebtoken";
import { NETWORKS } from "../constants";
import { useContractLoader } from "../hooks";
import { getNFTAndMetaData } from "../helpers/metadata";

const { ethers } = require("ethers");

const targetNetwork = NETWORKS.matic;
// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
const localProvider = new ethers.providers.StaticJsonRpcProvider(localProviderUrlFromEnv);

export default function EnterpriseUserDashboard() {
  const history = useHistory();

  const token = localStorage.getItem("token");

  const [tableDataSrc, setTableDataSrc] = useState();
  const [loading, setLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState();
  const [loggedInUserOrg, setLoggedInUserOrg] = useState();
  const [contract, setContract] = useState();

  useEffect(() => {
    const tokenUser = jwt.decode(token);
    setLoggedInUser(tokenUser);
    setLoggedInUserOrg(tokenUser.org);
  }, [loading]);

  const viewData = walletAddress => {
    history.push(`/EnterpriseUserViewKYCData/${walletAddress}`);
  };

  const getAllWalletUsers = async () => {
    const response = await fetch(`http://localhost:8000/api/getAllWalletUsers`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.status === 200 && data.length > 0) {
      return data;
    }

    console.log("Failed to get all wallet users");
    return [];
  };

  const readContracts = useContractLoader(localProvider);
  console.log("dashboard readContracts", readContracts);

  useEffect(() => {
    if (loading && readContracts) {
      setContract(readContracts);
    }
  }, [readContracts]);

  useEffect(() => {
    if (loading && contract) {
      const getData = async () => {
        const addressList = await getAllWalletUsers();

        let allWalletNFTMetadata = [];
        for (const address of addressList) {
          const walletAddress = address.walletAddress;
          const balance = 1; // hardcoding balance to 1 for now
          const nfts = await getNFTAndMetaData(balance, readContracts, walletAddress);
          if (nfts) allWalletNFTMetadata.push(...nfts);
        }
        console.log("allWalletNFTMetadata", allWalletNFTMetadata);

        setTableDataSrc(
          // attributes [AML, CRED_PROTOCOL_SCORE, IS_BUSINESS, COUNTRY, DID, USER_STATUS, WALLET_STATUS]
          allWalletNFTMetadata &&
            allWalletNFTMetadata.map(row => ({
              aml: row.attributes[0].value,
              cred: row.attributes[1].value,
              business: row.attributes[2].value === "TRUE" ? "Yes" : "No",
              country: row.attributes[3].value,
              address: row.attributes[4].value,
              userStatus: row.attributes[5].value === "TRUE" ? "Passed" : "Failed",
              walletStatus: row.attributes[6].value === "TRUE" ? "Passed" : "Failed",
              badges: <img src={row.image} style={{ maxWidth: 50 }} alt="NFT badge" />,
              action: (
                <Button shape="round" size="large" type="default">
                  View data
                </Button>
              ),
            })),
        );

        setLoading(false);
      }

      getData();
    }
  }, [contract]);

  const columns = [
    {
      title: "Wallet address",
      dataIndex: "address",
      key: "org",
      width: 225,
    },
    {
      title: "User Status",
      dataIndex: "userStatus",
      key: "userStatus",
      width: 50,
    },
    {
      title: "Wallet Status",
      dataIndex: "walletStatus",
      key: "walletStatus",
      width: 50,
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
      width: 100,
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 150,
      onCell: (record, rowIndex) => {
        return {
          onClick: () => {
            viewData(record.address);
          },
        };
      },
    },
  ];

  return (
    <div style={{ width: 1300, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <div>
        <h1>All Wallets</h1>
        <div>
          {loading ? (
            "No wallets found"
          ) : (
            <div>
              <Table columns={columns} dataSource={tableDataSrc} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
