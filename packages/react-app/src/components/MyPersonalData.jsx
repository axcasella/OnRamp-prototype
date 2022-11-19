import React, { useState, useEffect } from "react";
import { Table, Button } from "antd";

const { Column } = Table;

export default function MyPersonalData() {
  const walletAddress = localStorage.getItem("walletAddress");

  const [tableDataSrc, setTableDataSrc] = useState();
  const [loading, setLoading] = useState(true);
  const [showDecryptButton, setShowDecryptButton] = useState(true);

  const getMyPersonalEncryptedData = async () => {
      console.log("Called getMyPersonalEncryptedData");

    const response = await fetch(`http://localhost:8000/api/getUserEncryptedKYCData/walletAddress/${walletAddress}`, {
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
          zip: row.zip,
          birthdate: row.birthdate,
          phone: row.phone,
        })),
      );
      setLoading(false);
      console.log("tableDataSrc", tableDataSrc);
    } else {
      alert("Failed to get encrypted KYC data");
    }
  };

  useEffect(() => {
    getMyPersonalEncryptedData();
  }, [walletAddress]);

  const getMyPersonalDecryptedData = async () => {
    const response = await fetch(`http://localhost:8000/api/getUserDecryptedKYCData/walletAddress/${walletAddress}`, {
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
          zip: row.zip,
          birthdate: row.birthdate,
          phone: row.phone,
        })),
      );
      setLoading(false);
      setShowDecryptButton(false);
      console.log("tableDataSrc", tableDataSrc);
    } else {
      alert("Failed to get decrypted KYC data");
    }
  };

  return (
    <div>
      {loading ? (
        "Loading KYC data"
      ) : (
        <div>
            <Table dataSource={tableDataSrc}>
            <Column title="Wallet Address" dataIndex="walletAddress" key="walletAddress" width="10%" />
            <Column title="First Name" dataIndex="firstname" key="firstname" width="10%" />
            <Column title="Last Name" dataIndex="lastname" key="lastname" width="10%" />
            <Column title="Address" dataIndex="address" key="address" width="10%" />
            <Column title="Birthdate" dataIndex="birthdate" key="birthdate" width="10%" />
            <Column title="Phone" dataIndex="phone" key="phone" width="10%" />
            <Column title="City" dataIndex="city" key="city" width="10%" />
            <Column title="State" dataIndex="state" key="state" width="10%" />
            <Column title="Country" dataIndex="country" key="country" width="5%" />
            <Column title="Zip" dataIndex="zip" key="zip" width="5%" />
            <Column title="SSN" dataIndex="ssn" key="ssn" width="10%" />
            </Table>

            {showDecryptButton ? (
                <Button onClick={getMyPersonalDecryptedData}> Decrypt my data </Button>
            ) : (
                <p>Only you and dapps you have given access to can see your decrypted data</p>
            )}
        </div>
      )}
    </div>
  );
}
