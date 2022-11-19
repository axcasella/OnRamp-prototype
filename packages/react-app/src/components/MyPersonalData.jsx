import React, { useState, useEffect } from "react";
import { Space, Table, Tag } from "antd";

const { Column, ColumnGroup } = Table;

export default function MyPersonalData() {
  const walletAddress = localStorage.getItem("walletAddress");

  const [tableDataSrc, setTableDataSrc] = useState();
  const [loading, setLoading] = useState(true);

  const getMyPersonalData = async () => {
    const response = await fetch(`http://localhost:8000/api/getMyKYCData/walletAddress/${walletAddress}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.status === 200 && data) {
      console.log(data);
      setTableDataSrc(
        [data].map(row => ({
          walletAddress: row.walletAddress,
          firstname: row.firstname,
          lastname: row.lastname,
          address: row.address,
          ssn: row.ssn,
          email: row.email,
          city: row.city,
          state: row.state,
          country: row.country,
          birthdate: row.birthdate,
          phone: row.phone,
        })),
      );
      setLoading(false);
      console.log("tableDataSrc", tableDataSrc);
    } else {
      alert("Failed to get KYC data");
    }
  };

  useEffect(() => {
    getMyPersonalData();
  }, [walletAddress]);

  return (
    <div>
      {loading ? (
        "Loading KYC data"
      ) : (
        <Table dataSource={tableDataSrc}>
          <Column title="Wallet Address" dataIndex="walletAddress" key="walletAddress" />
          <Column title="First Name" dataIndex="firstname" key="firstname" />
          <Column title="Last Name" dataIndex="lastname" key="lastname" />
          <Column title="Address" dataIndex="address" key="address" />
          <Column title="Birthdate" dataIndex="birthdate" key="birthdate" />
          <Column title="Phone" dataIndex="phone" key="phone" />
          <Column title="City" dataIndex="city" key="city" />
          <Column title="State" dataIndex="state" key="state" />
          <Column title="Country" dataIndex="country" key="country" />
          <Column title="SSN" dataIndex="ssn" key="ssn" />
        </Table>
      )}
    </div>
  );
}
