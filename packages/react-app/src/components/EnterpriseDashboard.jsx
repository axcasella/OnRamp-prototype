import React, { useState, useEffect } from "react";
import { Table, Button } from "antd";

export default function EnterpriseDashboard() {
  const [tableDataSrc, setTableDataSrc] = useState();
  const [loading, setLoading] = useState(true);

  const getAllWalletUsers = async () => {
    const response = await fetch(`http://localhost:8000/api/getAllWalletUsers`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.status === 200 && data) {
      console.log("all users", data);
      setTableDataSrc(
        [data].map(row => ({
          walletAddress: row[0].walletAddress,
        })),
      );
      setLoading(false);
    } else {
      alert("Failed to get all wallet users");
    }
  };

  useEffect(() => {
    getAllWalletUsers();
  }, []);

  const columns = [
    {
      title: "Wallet Address",
      dataIndex: "walletAddress",
      key: "walletAddress",
      width: 500,
    },
    {
      title: "Available Action",
      dataIndex: "availableAction",
      key: "availableAction",
      width: 100,
      render: (text, row, index) => <Button type="primary">Request</Button>,
      onCell: (record, rowIndex) => {
        return {
          onClick: () => {
            console.log("Clicked: ", record, rowIndex);
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
            "Loading all users"
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
