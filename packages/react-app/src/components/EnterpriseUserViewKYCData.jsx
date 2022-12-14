import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { Table, Button } from "antd";

export default function EnterpriseUserViewKYCData() {
  const params = useParams();
  const walletAddress = params.walletAddress;

  const history = useHistory();

  const [tableDataSrc, setTableDataSrc] = useState();
  const [loading, setLoading] = useState(true);
  const [showDecryptButton, setShowDecryptButton] = useState(true);

  const getMyPersonalEncryptedData = async () => {
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
    } else {
      alert("Failed to get decrypted KYC data");
    }
  };

  const columns = [
    {
      title: "Wallet Address",
      dataIndex: "walletAddress",
      key: "walletAddress",
      width: 225,
    },
    {
      title: "First Name",
      dataIndex: "firstname",
      key: "firstname",
      ellipsis: true,
      width: 150,
    },
    {
      title: "Last Name",
      dataIndex: "lastname",
      key: "lastname",
      ellipsis: true,
      width: 150,
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
      width: 120,
    },
    {
      title: "Birthdate",
      dataIndex: "birthdate",
      key: "birthdate",
      ellipsis: true,
      width: 120,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      ellipsis: true,
      width: 100,
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      ellipsis: true,
      width: 75,
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      ellipsis: true,
      width: 80,
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      ellipsis: true,
      width: 100,
    },
    {
      title: "Zip",
      dataIndex: "zip",
      key: "zip",
      ellipsis: true,
      width: 75,
    },
    {
      title: "SSN",
      dataIndex: "ssn",
      key: "ssn",
      ellipsis: true,
      width: 75,
    },
  ];

  return (
    <div style={{ width: 1400, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      {loading ? (
        "Loading User's KYC data"
      ) : (
        <div>
          <Table columns={columns} dataSource={tableDataSrc} />
          {showDecryptButton ? (
            <Button type="primary" shape="round" size="large" onClick={getMyPersonalDecryptedData}>
              {" "}
              Decrypt user data{" "}
            </Button>
          ) : (
            <h4>Your dapp has access to this user's encrypted data</h4>
          )}
          <Button shape="round" size="large" type="default" style={{ marginLeft: 10 }} onClick={() => history.goBack()}>
            Back
          </Button>
        </div>
      )}
    </div>
  );
}
