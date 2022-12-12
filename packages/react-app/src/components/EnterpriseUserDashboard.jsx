import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Table, Button } from "antd";
import jwt from "jsonwebtoken";
import { NFTBadges } from ".";
import { INFURA_ID, NETWORKS } from "../constants";
import { useContractLoader } from "../hooks";

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
  const [addressList, setAddressList] = useState();

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
      console.log("data", data);

      setAddressList(data);
      console.log("addesss list", addressList);

      // setTableDataSrc(
      //   [data].map(row => ({
      //     walletAddress: row[0].walletAddress,
      //     org: loggedInUserOrg,
      //     consentedOrgs: row[0].consentedOrgs,
      //     displayText: <Button type="primary">View data</Button>,
      //   })),
      // );
      setLoading(false);
    } else {
      console.log("Failed to get all wallet users");
    }
  };

  const readContracts = useContractLoader(localProvider);
  console.log("dashboard localProvider", localProvider);
  console.log("dashboard readContracts", readContracts);

  useEffect(() => {
    getAllWalletUsers();
  }, [loading]);

  const columns = [
    {
      title: "Wallet Address",
      dataIndex: "walletAddress",
      key: "walletAddress",
      width: 500,
    },
    {
      title: "Available Action",
      dataIndex: "displayText",
      key: "displayText",
      width: 100,
      onCell: (record, rowIndex) => {
        return {
          onClick: () => {
            viewData(record.walletAddress);
          },
        };
      },
    },
  ];

  return (
    <div style={{ width: 1200, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <div>
        <h1>All users</h1>
        <div>
          {loading ? (
            "No users found"
          ) : (
            <div>
              {addressList.map(address => (
                <NFTBadges readContracts={readContracts} walletAddress={address.walletAddress} />
              ))}
              {/* <Table columns={columns} dataSource={tableDataSrc} /> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
