import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Table, Button } from "antd";
import jwt from "jsonwebtoken";

export default function EnterpriseUserDashboard() {
  const history = useHistory();

  const token = localStorage.getItem("token");

  const [tableDataSrc, setTableDataSrc] = useState();
  const [loading, setLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState();
  const [loggedInUserOrg, setLoggedInUserOrg] = useState();

  useEffect(() => {
    const tokenUser = jwt.decode(token);
    setLoggedInUser(tokenUser);
    setLoggedInUserOrg(tokenUser.org);
  }, [token]);

  const viewData = walletAddress => {
    history.push(`/EnterpriseUserViewKYCData/${walletAddress}`);
  };

  const requestConsent = async (walletAddress, org) => {
    const response = await fetch("http://localhost:8000/api/requestConsent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        walletAddress,
        org,
      }),
    });

    const data = await response.json();

    if (data.status === "ok") {
      console.log("request consent success");
    } else if (data.status === "already exists") {
      alert(org + " already requested consent");
    } else {
      alert("request consent failed");
    }
  }

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
      setTableDataSrc(
        [data].map(row => ({
          walletAddress: row[0].walletAddress,
          org: loggedInUserOrg,
          consentedOrgs: row[0].consentedOrgs,
          displayText: row[0].consentedOrgs.includes(loggedInUserOrg) ? (
            <Button type="primary">View data</Button>
          ) : (
            <Button>Request permission</Button>
          ),
        })),
      );
      setLoading(false);
    } else {
      console.log("Failed to get all wallet users");
    }
  };

  useEffect(() => {
    getAllWalletUsers();
  }, [loggedInUserOrg]);

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
            if (record.consentedOrgs.includes(record.org)) {
              viewData(record.walletAddress);
            } else {
              requestConsent(record.walletAddress, record.org)
            }
          },
        };
      },
    },
  ];

  return (
    <div style={{ width: 1000, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <div>
        <h1>All users</h1>
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
    </div>
  );
}
