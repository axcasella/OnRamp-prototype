import React, { useState, useEffect } from "react";
import { Table, Button } from "antd";

export default function RegularUserConsentRequests() {
  const walletAddress = localStorage.getItem("walletAddress");

  const [tableDataSrc, setTableDataSrc] = useState();
  const [loading, setLoading] = useState(true);

  const getMyConsentRequests = async () => {
    const response = await fetch(`http://localhost:8000/api/getConsentRequests/walletAddress/${walletAddress}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.status === 200 && data) {
      setTableDataSrc(
        data.consentRequests.map(row => ({
          org: row,
          walletAddress,
          action: <Button type="primary">Give permission</Button>,
        })),
      );
      setLoading(false);
    } else {
      alert("Failed to get consent requests");
    }
  };

  const addConsent = async (address, org) => {
    const response = await fetch(`http://localhost:8000/api/addConsent`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        walletAddress: address,
        org,
      }),
    });

    const data = await response.json();

    if (data.status === "ok") {
      console.log("add consent success");
    } else {
      alert("Failed to add consent");
    }
  };

  useEffect(() => {
    getMyConsentRequests();
  }, [walletAddress]);

  const columns = [
    {
      title: "Requesting org",
      dataIndex: "org",
      key: "org",
      width: 200,
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 100,
      onCell: (record, rowIndex) => {
        return {
          onClick: () => {
            addConsent(record.walletAddress, record.org);
          },
        };
      },
    },
  ];

  return (
    <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      {loading ? (
        "Loading my consent requests"
      ) : (
        <div>
          <Table columns={columns} dataSource={tableDataSrc} />
        </div>
      )}
    </div>
  );
}
